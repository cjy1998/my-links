<template>
  <div class="app-container app-js df fdc">
    <el-form
      class="top-form"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="自定义排序字段" prop="orderByFileds">
        <el-select
          v-model="queryParams.orderByFileds"
          placeholder="排序字段"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in orderByFileds"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="自定义排序规则" prop="orderByRule">
        <el-select
          v-model="queryParams.orderByRule"
          placeholder="排序字段"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in orderByRules"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="店铺名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入店铺名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="订单状态"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:post:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:post:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:post:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['system:user:import']"
          >导入</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <div class="f1">
      <el-table
        height="100%"
        v-loading="loading"
        :data="postList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="店铺名称" align="center" prop="name" />
        <el-table-column label="订单号" align="center" prop="orderNo" />

        <el-table-column
          label="订单创建时间"
          align="center"
          prop="orderCreateTime"
        />
        <el-table-column
          label="订单状态"
          align="center"
          prop="orderorderStatus"
        >
          <template #default="scope">
            <dict-tag
              :options="sys_normal_disable"
              :value="scope.row.orderorderStatus"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品总价" align="center" prop="shopAllPrice" />
        <el-table-column label="商品单价" align="center" prop="shopPrice" />
        <el-table-column label="实付金额" align="center" prop="shopPayPrice" />
        <el-table-column label="商品id" align="center" prop="shopId" />
        <el-table-column label="商品名称" align="center" prop="shopName" />
        <el-table-column label="商品规格" align="center" prop="shopSpec" />
        <el-table-column label="下单数量" align="center" prop="buyNum" />
        <el-table-column label="下单时间" align="center" prop="buyTime" />
        <el-table-column label="收件人" align="center" prop="buyName" />
        <el-table-column label="收件人电话" align="center" prop="buyPhone" />
        <el-table-column label="收件人地址" align="center" prop="buyAddress" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column
          label="操作"
          width="180"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:post:edit']"
              >修改</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:post:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      :selection="ids.length"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      draggable
      :close-on-click-modal="false"
      width="800px"
      append-to-body
    >
      <el-form ref="postRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-radio-group v-model="form.orderStatus">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单创建时间" prop="orderCreateTime">
          <el-date-picker
            v-model="form.orderCreateTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="商品总价" prop="shopAllPrice">
          <el-input-number
            v-model="form.shopAllPrice"
            controls-position="right"
            placeholder="请输入商品总价"
          />
        </el-form-item>
        <el-form-item label="商品单价" prop="shopPrice">
          <el-input v-model="form.shopPrice" placeholder="请输入商品单价" />
        </el-form-item>
        <el-form-item label="实付金额" prop="shopPayPrice">
          <el-input v-model="form.shopPayPrice" placeholder="请输入实付金额" />
        </el-form-item>

        <el-form-item label="商品id" prop="shopId">
          <el-input v-model="form.shopId" placeholder="请输入商品id" />
        </el-form-item>
        <el-form-item label="商品名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品规格" prop="shopSpec">
          <el-input v-model="form.shopSpec" placeholder="请输入商品规格" />
        </el-form-item>

        <el-form-item label="下单数量" prop="buyNum">
          <el-input v-model="form.buyNum" placeholder="请输入下单数量" />
        </el-form-item>
        <el-form-item label="下单时间" prop="buyTime">
          <el-date-picker
            v-model="form.buyTime"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="收件人" prop="buyName">
          <el-input v-model="form.buyName" placeholder="请输入收件人" />
        </el-form-item>

        <el-form-item label="收件人电话" prop="buyPhone">
          <el-input v-model="form.buyPhone" placeholder="请输入收件人电话" />
        </el-form-item>

        <el-form-item label="收件人地址" prop="buyAddress">
          <el-input v-model="form.buyAddress" placeholder="请输入收件人地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 导入对话框 -->
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox
                v-model="upload.updateSupport"
              />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link
              type="primary"
              :underline="false"
              style="font-size: 12px; vertical-align: baseline"
              @click="importTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Customer">
import {
  listCustomer,
  addCustomer,
  delCustomer,
  getCustomer,
  updateCustomer,
} from "@/api/customer/info";
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
import { getToken } from "@/utils/auth";

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: false,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/customer/importData",
});
const orderByFileds = ref([
  { value: "orderNo", label: "订单号" },
  { value: "name", label: "店铺名称" },
  { value: "orderStatus", label: "订单状态" },
  { value: "orderCreateTime", label: "订单创建时间" },
  { value: "shopAllPrice", label: "商品总价" },
  { value: "shopPrice", label: "商品单价" },
  { value: "shopPayPrice", label: "实付金额" },
  { value: "shopId", label: "商品id" },
  { value: "shopName", label: "商品名称" },
  { value: "shopSpec", label: "商品规格" },
  { value: "buyNum", label: "下单数量" },
  { value: "buyTime", label: "下单时间" },
  { value: "buyName", label: "收件人" },
  { value: "buyPhone", label: "收件人电话" },
  { value: "buyAddress", label: "收件人地址" },
]);
const orderByRules = ref([
  { value: "asc", label: "升序" },
  { value: "desc", label: "降序" },
]);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    orderNo: undefined,
    name: undefined,
    orderStatus: undefined,
  },
  rules: {
    name: [{ required: true, message: "店铺名称不能为空", trigger: "blur" }],
    orderNo: [{ required: true, message: "订单号不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户信息列表 */
function getList() {
  loading.value = true;
  listCustomer(queryParams.value).then((response) => {
    postList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    orderNo: undefined,
    name: undefined,
    orderStatus: "0",
    remark: undefined,
  };
  proxy.resetForm("postRef");
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户信息";
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getCustomer(id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户信息";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCustomer(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomer(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除客户信息编号为"' + id + '"的数据项？')
    .then(function () {
      return delCustomer(id);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "system/post/export",
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`
  );
}
/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
}
/** 下载模板操作 */
function importTemplate() {
  proxy.download(
    "customer/importTemplate",
    {},
    `customer_template_${new Date().getTime()}.xlsx`
  );
}
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
}
getList();
</script>
