<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表信息 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag closable @close="handleClose(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限区域 -->
              <el-col :span="19">
                <!-- 通过for循环渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="handleClose(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="handleClose(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" min-width="140px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容的主体区域 -->
      <!-- 添加角色的表单区域 -->
      <el-form
        label-width="80px"
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色信息对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      /* 所有角色列表数据 */
      rolesList: [],
      /* 添加角色对话框的显示与隐藏 */
      addDialogVisible: false,
      /* 添加的表单数据 */
      addForm: {},
      /* 添加的表单数据验证规则 */
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [{ required: false }]
      },
      /* 修改角色对话框的显示与隐藏 */
      editDialogVisible: false,
      /* 编辑角色的表单 */
      editForm: {},
      /* 编辑角色表单的验证规则 */
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blure' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [{ required: false }]
      },
      /* 分配权限对话框的显示和隐藏 */
      setRightDialogVisible: false,
      /* 权限列表 */
      rightsList: [],
      /* 树形控件的属性绑定对象 */
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      /* 默认选中节点的id值数组 */
      defKeys: [],
      /* 当前即将分配权限的角色id */
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    /* 获取角色列表 */
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    /* 关闭对话框重置表单数据和验证信息 */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    /* 监听对话框确定按钮 */
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('创建角色失败')
        this.$message.success('创建角色成功！')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    /* 监听编辑按钮点击事件 */
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      this.editForm = res.data
      console.log(this.editForm)
    },
    /* 监听关闭对话框事件 然后重置表单数据 */
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    /* 监听编辑对话框的确定按钮事件 */
    editRolesInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        this.$message.success('修改角色信息成功！')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    /* 监听删除操作的按钮 */
    async removeRoleById(id) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        return err
      })
      if (confirmRes === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
      }
    },
    /* 监听删除权限标签的操作 */
    async handleClose(role, rightId) {
      const confirmRes = await this.$confirm(
        '此操作将删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message('已取消删除操作！')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除权限成功！')
      // this.getRolesList()
      role.children = res.data
    },
    /* 展示分配权的对话框 */
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      /* 递归获取三级权限的id */
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    /* 通过递归获取角色下所有的三级权限的id，并且保存到defKeys数组中 */
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    /* 监听分配权限对话框的关闭时间 */
    setRightDialogClosed() {
      this.defKeys = []
    },
    /* 点击为角色分配权限  */
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
