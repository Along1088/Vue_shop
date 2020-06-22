<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="消息提示的文案"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 包裹左侧tabs标签栏的form表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 左侧标签栏区域 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabsChange"
          @tab-click="tabClicked"
        >
          <!-- tab标签栏切换的面板区域 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in manyTableData"
              :key="index"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  v-for="(item1, index1) in item.attr_vals"
                  :key="index1"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="upLoadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewPic" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        /* 商品所属的分类数组 */
        goods_cat: [],
        /* 图片的数组 */
        pics: [],
        /* 商品的内容描述 */
        goods_introduce: '',
        /* 动态参数和静态属性对象组成的数组 */
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      /* 所有分类的数据列表 */
      cateList: [],
      /* 级联选择框的配置选项 */
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      /* 动态参数列表数据 */
      manyTableData: [],
      /* 静态属性列表 */
      onlyTableData: [],
      /* 上传图片的Url */
      upLoadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      /* 上传图片的请求头对象 */
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      /* 预览图片的路径 */
      previewPath: '',
      /* 预览图片对话框的显示和隐藏 */
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /* 获取所有商品分类信息 */
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败！')
      }
      this.$message.success('获取分类列表成功！')
      this.cateList = res.data
      console.log(this.cateList)
    },
    /* 级联选择器选中变化会触发的函数 */
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = [])
      }
      console.log(this.addForm.goods_cat)
    },
    /* 监听tabs标签页的切换事件 */
    beforeTabsChange(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.warning('请先选择商品的分类信息！')
        return false
      }
    },
    async tabClicked() {
      /* 访问的是动态参数面板 */
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : null
        })

        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        /* 访问的是静态属性 */
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败！')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    /* 预览图片的处理函数 */
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    /* 处理移除图片的操作 */
    handleRemove(file) {
      /* 1.获取将要删除的图片的临时路径 */
      const filePath = file.response.data.tmp_path
      /* 2.从pics数组中，找到这个图片对应的索引值 */
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      /* 3.调用数组的splice方法,把图片信息对象从pics数组中删除 */
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    /* 监听图片上传成功的事件 */
    handleSuccess(response) {
      /* 1.拼接得到一个图片信息对象 */
      const pic = { pic: response.data.tmp_path }
      /* 2.将图片信息对象push到pics数组中 */
      this.addForm.pics.push(pic)
      console.log(this.addForm)
    },
    /* 添加商品 */
    add() {
      /* 表单预校验 */
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('添加商品信息不合法！')
        // 执行业务逻辑
        /*  1.goods_cat双向绑定到了级联选择器 而级联选择器需要一个数组（可以选择多个值）
        2.提交表单时，后台需要good_cat是一个','分割字符串
        3.直接join然后赋值给原来的表单会冲突
        4.使用lodash cloneDeep(obj) 深拷贝一个和原来的addForm不相关的对象  */
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        const cloneDeepAddForm = _.cloneDeep(this.addForm)
        cloneDeepAddForm.goods_cat = cloneDeepAddForm.goods_cat.join(',')
        /* 处理动态参数 */
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        /* 处理静态属性 */
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        /* 将提交深度克隆的表单 so把addForm表单中的attrs赋值给克隆出来的表单 */
        cloneDeepAddForm.attrs = this.addForm.attrs
        console.log(cloneDeepAddForm)
        /* 发起请求添加商品 */
        /* 商品的名称必须是唯一的 */
        const { data: res } = await this.$http.post('goods', cloneDeepAddForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return false
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewPic {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
