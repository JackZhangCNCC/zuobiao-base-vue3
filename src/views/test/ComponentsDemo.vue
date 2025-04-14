<template>
  <div class="components-demo">
    <h1 class="demo-title">ZB组件展示</h1>

    <!-- 按钮 -->
    <div class="demo-section">
      <h2 class="section-title">按钮 zb-button</h2>

      <div class="demo-item">
        <h3>主要按钮</h3>
        <div class="demo-row">
          <zb-button type="primary">默认样式</zb-button>
          <zb-button type="primary" disabled>禁用样式</zb-button>
          <zb-button type="primary" loading>加载中</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>次要按钮</h3>
        <div class="demo-row">
          <zb-button type="default">默认样式</zb-button>
          <zb-button type="default" disabled>禁用样式</zb-button>
          <zb-button type="default" loading>加载中</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>告警按钮</h3>
        <div class="demo-row">
          <zb-button type="warning">默认样式</zb-button>
          <zb-button type="warning" disabled>禁用样式</zb-button>
          <zb-button type="warning" loading>加载中</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>Antd图标按钮 (推荐，自适应背景)</h3>
        <div class="demo-row">
          <zb-button type="primary" iconType="antd" icon="plus">
            <template #icon>
              <plus-outlined />
            </template>
            添加
          </zb-button>
          <zb-button type="default" iconType="antd" icon="edit">
            <template #icon>
              <edit-outlined />
            </template>
            编辑
          </zb-button>
          <zb-button type="warning" iconType="antd" icon="delete">
            <template #icon>
              <delete-outlined />
            </template>
            删除
          </zb-button>
          <zb-button type="primary" iconType="antd" icon="plus" loading>
            <template #icon>
              <plus-outlined />
            </template>
            添加中
          </zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>本地图标按钮</h3>
        <div class="demo-row">
          <zb-button
            type="primary"
            iconType="image"
            iconSrc="/src/assets/images/btn/add.png"
          >
            添加
          </zb-button>
          <zb-button
            type="default"
            iconType="image"
            iconSrc="/src/assets/images/btn/edit.png"
          >
            编辑
          </zb-button>
          <zb-button
            type="warning"
            iconType="image"
            iconSrc="/src/assets/images/btn/delete2.png"
          >
            删除
          </zb-button>
          <zb-button
            type="primary"
            iconType="image"
            iconSrc="/src/assets/images/btn/add.png"
            loading
          >
            添加中
          </zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>动态loading示例</h3>
        <div class="demo-row">
          <zb-button
            type="primary"
            :loading="loading1"
            @click="toggleLoading('loading1')"
          >
            {{ loading1 ? "加载中..." : "点击加载" }}
          </zb-button>
          <zb-button
            type="default"
            iconType="antd"
            icon="download"
            :loading="loading2"
            @click="toggleLoading('loading2')"
          >
            <template #icon>
              <download-outlined />
            </template>
            {{ loading2 ? "下载中..." : "下载文件" }}
          </zb-button>
          <zb-button
            type="warning"
            iconType="image"
            iconSrc="/src/assets/images/btn/delete2.png"
            :loading="loading3"
            @click="toggleLoading('loading3')"
          >
            {{ loading3 ? "删除中..." : "删除文件" }}
          </zb-button>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="demo-section">
      <h2 class="section-title">输入框 zb-input</h2>
      <div class="demo-item">
        <h3>基础输入框</h3>
        <div class="demo-row">
          <zb-input
            v-model="inputValue"
            placeholder="请输入内容"
            style="width: 300px"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>禁用状态</h3>
        <div class="demo-row">
          <zb-input disabled placeholder="禁用状态" style="width: 300px" />
        </div>
      </div>

      <div class="demo-item">
        <h3>带字数限制</h3>
        <div class="demo-row">
          <zb-input
            v-model="countInputValue"
            placeholder="最多输入20个字符"
            :maxlength="20"
            show-count
            style="width: 300px"
          />
        </div>
      </div>
    </div>

    <!-- 文本域 -->
    <div class="demo-section">
      <h2 class="section-title">文本域 zb-textarea</h2>
      <div class="demo-item">
        <h3>基础文本域</h3>
        <div class="demo-row">
          <zb-textarea
            v-model="textareaValue"
            placeholder="请输入多行文本"
            style="width: 500px"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>带字数限制</h3>
        <div class="demo-row">
          <zb-textarea
            v-model="countTextareaValue"
            placeholder="最多输入100个字符"
            :maxlength="100"
            show-count
            style="width: 500px"
          />
        </div>
      </div>
    </div>

    <!-- 选择器 -->
    <div class="demo-section">
      <h2 class="section-title">选择器 zb-select</h2>
      <div class="demo-item">
        <h3>基础选择器</h3>
        <div class="demo-row">
          <zb-select
            v-model="selectValue"
            placeholder="请选择"
            style="width: 300px"
            :options="selectOptions"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>多选选择器</h3>
        <div class="demo-row">
          <zb-select
            v-model="multiSelectValue"
            mode="multiple"
            placeholder="请选择多项"
            style="width: 400px"
            :options="selectOptions"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>禁用状态</h3>
        <div class="demo-row">
          <zb-select
            disabled
            placeholder="禁用状态"
            style="width: 300px"
            :options="selectOptions"
          />
        </div>
      </div>
    </div>

    <!-- 日期选择器 -->
    <div class="demo-section">
      <h2 class="section-title">日期选择器 zb-date-picker</h2>
      <div class="demo-item">
        <h3>基础日期选择器</h3>
        <div class="demo-row">
          <zb-date-picker
            v-model="dateValue"
            placeholder="请选择日期"
            style="width: 300px"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>带时间选择</h3>
        <div class="demo-row">
          <zb-date-picker
            v-model="dateTimeValue"
            show-time
            placeholder="请选择日期和时间"
            style="width: 300px"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>禁用状态</h3>
        <div class="demo-row">
          <zb-date-picker
            disabled
            placeholder="禁用状态"
            style="width: 300px"
          />
        </div>
      </div>
    </div>

    <!-- 复选框 -->
    <div class="demo-section">
      <h2 class="section-title">复选框 zb-checkbox</h2>
      <div class="demo-item">
        <h3>基础复选框</h3>
        <div class="demo-row">
          <zb-checkbox v-model="checkboxValue1">选项1</zb-checkbox>
          <zb-checkbox v-model="checkboxValue2">选项2</zb-checkbox>
        </div>
      </div>

      <div class="demo-item">
        <h3>禁用状态</h3>
        <div class="demo-row">
          <zb-checkbox disabled>禁用未选</zb-checkbox>
          <zb-checkbox disabled :model-value="true">禁用已选</zb-checkbox>
        </div>
      </div>

      <div class="demo-item">
        <h3>复选框组</h3>
        <div class="demo-row">
          <zb-checkbox-group
            v-model="checkboxGroupValue"
            :options="checkOptions"
          />
        </div>
      </div>
    </div>

    <!-- 单选按钮 -->
    <div class="demo-section">
      <h2 class="section-title">单选按钮 zb-radio</h2>
      <div class="demo-item">
        <h3>基础单选按钮</h3>
        <div class="demo-row">
          <zb-radio v-model="radioValue1">选项1</zb-radio>
          <zb-radio v-model="radioValue2">选项2</zb-radio>
        </div>
      </div>

      <div class="demo-item">
        <h3>禁用状态</h3>
        <div class="demo-row">
          <zb-radio disabled>禁用未选</zb-radio>
          <zb-radio disabled :model-value="true">禁用已选</zb-radio>
        </div>
      </div>

      <div class="demo-item">
        <h3>单选按钮组</h3>
        <div class="demo-row">
          <zb-radio-group v-model="radioGroupValue" :options="radioOptions" />
        </div>
      </div>

      <div class="demo-item">
        <h3>按钮样式</h3>
        <div class="demo-row">
          <zb-radio-group v-model="radioButtonValue" button-style="solid">
            <a-radio-button value="a">选项A</a-radio-button>
            <a-radio-button value="b">选项B</a-radio-button>
            <a-radio-button value="c">选项C</a-radio-button>
          </zb-radio-group>
        </div>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="demo-section">
      <h2 class="section-title">搜索表单 zb-search-form</h2>
      <div class="demo-item">
        <zb-search-form
          :fields="searchFields"
          keyword-placeholder="输入关键词搜索"
          :initial-values="searchInitialValues"
          @search="handleSearch"
        />
      </div>
    </div>

    <!-- 表格组件全功能展示 -->
    <div class="demo-section">
      <h2 class="section-title">表格组件基本功能展示 zb-table</h2>
      <div class="demo-item">
        <TableBasicDemo />
      </div>
    </div>

    <!-- 表格组件全功能展示 -->
    <div class="demo-section">
      <h2 class="section-title">表格组件全功能展示 zb-table</h2>
      <div class="demo-item">
        <TableDemo />
      </div>
    </div>

    <!-- 弹框组件 -->
    <div class="demo-section">
      <h2 class="section-title">弹框组件 zb-modal</h2>

      <div class="demo-item">
        <h3>基本弹框</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="showBasicModal = true"
            >基本弹框</zb-button
          >
          <zb-button type="default" @click="showFormModal = true"
            >表单弹框</zb-button
          >
          <zb-button type="default" @click="showWideModal = true"
            >宽弹框</zb-button
          >
          <zb-button type="default" @click="showConfirmModal = true"
            >确认弹框</zb-button
          >
          <zb-button type="default" @click="showNoFooterModal = true"
            >无底部弹框</zb-button
          >
          <zb-button type="default" @click="showTreeSelectModal = true"
            >树形选择弹框</zb-button
          >
        </div>
      </div>

      <!-- 基本弹框 -->
      <zb-modal
        v-model:open="showBasicModal"
        title="基本弹框"
        :closable="false"
        @confirm="handleModalConfirm('basic')"
      >
        <p>这是一个基本的弹框内容</p>
        <p>支持多行内容展示</p>
      </zb-modal>

      <!-- 表单弹框 -->
      <zb-modal
        v-model:open="showFormModal"
        title="新增产品"
        :isForm="true"
        :confirmLoading="formSubmitLoading"
        @confirm="handleFormSubmit"
      >
        <zb-form :model="modalFormState" layout="vertical">
          <zb-form-item label="产品名称" required>
            <zb-input
              v-model:value="modalFormState.name"
              placeholder="请输入"
            />
          </zb-form-item>
          <zb-form-item label="类型">
            <zb-radio-group v-model:value="modalFormState.type">
              <zb-radio value="1">HO产品</zb-radio>
              <zb-radio value="2">IHO产品</zb-radio>
              <zb-radio value="3">自研产品</zb-radio>
            </zb-radio-group>
          </zb-form-item>
        </zb-form>
      </zb-modal>

      <!-- 宽弹框 -->
      <zb-modal
        v-model:open="showWideModal"
        title="宽弹框"
        width="800"
        @confirm="handleModalConfirm('wide')"
      >
        <div style="min-height: 200px">
          <p>这是一个宽度为800px的弹框</p>
          <p>适合展示更多的内容或复杂的表格</p>
        </div>
      </zb-modal>

      <!-- 确认弹框 -->
      <zb-modal
        v-model:open="showConfirmModal"
        title="提示"
        width="300"
        :confirmLoading="confirmLoading"
        @confirm="handleConfirmAction"
      >
        <div style="text-align: center; padding: 20px 0">
          是否确认删除该记录？
        </div>
      </zb-modal>

      <!-- 无底部弹框 -->
      <zb-modal
        v-model:open="showNoFooterModal"
        title="查看详情"
        :footer="false"
        width="700"
      >
        <div class="view-details">
          <div class="detail-item">
            <span class="label">产品名称：</span>
            <span class="value">企业管理平台</span>
          </div>
          <div class="detail-item">
            <span class="label">产品类型：</span>
            <span class="value">自研产品</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间：</span>
            <span class="value">2023-01-15</span>
          </div>
          <div class="detail-item">
            <span class="label">描述：</span>
            <span class="value">这是一个自研产品，主要用于企业内部管理。</span>
          </div>
        </div>
      </zb-modal>

      <!-- 树形选择弹框 -->
      <zb-tree-select-modal
        v-model:open="showTreeSelectModal"
        title="选择部门"
        :data="treeData"
        :selectedValues="selectedTreeValues"
        @confirm="handleTreeSelectConfirm"
        @cancel="handleTreeSelectCancel"
      />
    </div>

    <!-- 文件上传组件 -->
    <div class="demo-section">
      <h2 class="section-title">文件上传组件 zb-file-upload</h2>

      <div class="demo-item">
        <h3>基础文件上传</h3>
        <div class="demo-row">
          <zb-file-upload 
            v-model="uploadFileList"
            action="/investment/file/addFile"
            download-url="/investment/supplierfile/downLoadFileByStream"
            btn-text2="重新上传"
          />
          <p class="api-note">API路径: /investment/file/addFile</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>多文件上传</h3>
        <div class="demo-row">
          <zb-file-upload
            v-model="multiUploadFileList"
            :file-limit="3"
            btn-text="上传多个文件"
            btn-text2="继续上传"
            action="/investment/file/addFile"
            download-url="/investment/supplierfile/downLoadFileByStream"
          />
          <p class="api-note">多文件限制数：3</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>限制文件类型</h3>
        <div class="demo-row">
          <zb-file-upload
            v-model="pdfFileList"
            accept=".pdf"
            btn-text="上传PDF文件"
            action="/investment/file/addFile"
            download-url="/investment/supplierfile/downLoadFileByStream"
          />
          <p class="api-note">仅接受PDF文件</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>仅展示文件（无上传功能）</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="addDemoFile"
            >添加演示文件</zb-button
          >
          <div style="margin-top: 16px; width: 100%">
            <zb-file-upload
              v-model="readonlyFileList"
              :show-upload-btn="false"
              :use-real-api="false"
            />
          </div>
          <p class="api-note">只读模式，禁用上传按钮</p>
        </div>
      </div>
    </div>

    <!-- 这里添加Tab组件展示部分，紧接着文件上传组件的展示 -->
    <div class="demo-section">
      <h2 class="section-title">Tab选项卡 zb-tabs</h2>

      <div class="demo-item">
        <h3>基础用法</h3>
        <zb-tabs v-model="activeTab">
          <zb-tab-pane name="todo" label="我的待办">
            <div class="tab-content">
              <p>这是我的待办内容区域</p>
              <ul>
                <li>待办事项1</li>
                <li>待办事项2</li>
                <li>待办事项3</li>
              </ul>
            </div>
          </zb-tab-pane>
          <zb-tab-pane name="draft" label="草稿箱">
            <div class="tab-content">
              <p>这是草稿箱内容区域</p>
              <ul>
                <li>草稿1</li>
                <li>草稿2</li>
              </ul>
            </div>
          </zb-tab-pane>
        </zb-tabs>
      </div>

      <div class="demo-item">
        <h3>通过配置项创建</h3>
        <div>
          <zb-tabs
            v-model="configTab"
            :items="tabItems"
            @change="handleTabChange"
          />
          <div class="tab-content" v-if="configTab === 'tab1'">
            <p>这是选项卡1的内容</p>
          </div>
          <div class="tab-content" v-else-if="configTab === 'tab2'">
            <p>这是选项卡2的内容</p>
          </div>
          <div class="tab-content" v-else-if="configTab === 'tab3'">
            <p>这是选项卡3的内容</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 这里添加抽屉组件展示部分，紧接着Tab组件的展示 -->
    <div class="demo-section">
      <h2 class="section-title">抽屉 zb-drawer</h2>

      <div class="demo-item">
        <h3>基础用法</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="showBasicDrawer = true">打开右侧抽屉</zb-button>
          <zb-button type="default" @click="showLeftDrawer = true">打开左侧抽屉</zb-button>
          <zb-button type="default" @click="showTopDrawer = true">打开顶部抽屉</zb-button>
          <zb-button type="default" @click="showBottomDrawer = true">打开底部抽屉</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>不同尺寸</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="showSmallDrawer = true">小尺寸抽屉</zb-button>
          <zb-button type="default" @click="showDefaultDrawer = true">默认尺寸抽屉</zb-button>
          <zb-button type="default" @click="showLargeDrawer = true">大尺寸抽屉</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>表单抽屉</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="showFormDrawer = true">带表单的抽屉</zb-button>
        </div>
      </div>

      <div class="demo-item">
        <h3>自定义底部按钮</h3>
        <div class="demo-row">
          <zb-button type="primary" @click="showCustomButtonsDrawer = true">自定义底部按钮</zb-button>
          <zb-button type="default" @click="showLeftRightButtonsDrawer = true">左右分布按钮</zb-button>
          <zb-button type="default" @click="showCustomActionButtonsDrawer = true">自定义按钮动作</zb-button>
        </div>
      </div>

      <!-- 基础抽屉 - 右侧 -->
      <zb-drawer
        v-model:visible="showBasicDrawer"
        title="基础抽屉"
        placement="right"
        @confirm="handleDrawerConfirm('基础抽屉')"
      >
        <p>这是一个基础抽屉示例，位于右侧。</p>
        <p>抽屉是一种从屏幕边缘滑出的浮层面板，常用于在不打断整体流程的情况下，进行局部操作或展示信息。</p>
      </zb-drawer>

      <!-- 左侧抽屉 -->
      <zb-drawer
        v-model:visible="showLeftDrawer"
        title="左侧抽屉"
        placement="left"
        @confirm="handleDrawerConfirm('左侧抽屉')"
      >
        <p>这是一个位于左侧的抽屉示例。</p>
        <p>抽屉可以从四个方向弹出，包括左侧、右侧、顶部和底部。</p>
      </zb-drawer>

      <!-- 顶部抽屉 -->
      <zb-drawer
        v-model:visible="showTopDrawer"
        title="顶部抽屉"
        placement="top"
        @confirm="handleDrawerConfirm('顶部抽屉')"
      >
        <p>这是一个位于顶部的抽屉示例。</p>
        <p>顶部抽屉适合展示通知或简单的操作界面。</p>
      </zb-drawer>

      <!-- 底部抽屉 -->
      <zb-drawer
        v-model:visible="showBottomDrawer"
        title="底部抽屉"
        placement="bottom"
        @confirm="handleDrawerConfirm('底部抽屉')"
      >
        <p>这是一个位于底部的抽屉示例。</p>
        <p>底部抽屉适合展示更多选项或二级操作。</p>
      </zb-drawer>

      <!-- 小尺寸抽屉 -->
      <zb-drawer
        v-model:visible="showSmallDrawer"
        title="小尺寸抽屉"
        size="small"
        @confirm="handleDrawerConfirm('小尺寸抽屉')"
      >
        <p>这是一个小尺寸的抽屉示例。</p>
        <p>适合展示简单的信息或操作。</p>
      </zb-drawer>

      <!-- 默认尺寸抽屉 -->
      <zb-drawer
        v-model:visible="showDefaultDrawer"
        title="默认尺寸抽屉"
        size="default"
        @confirm="handleDrawerConfirm('默认尺寸抽屉')"
      >
        <p>这是一个默认尺寸的抽屉示例。</p>
        <p>适合展示常规的信息或操作。</p>
      </zb-drawer>

      <!-- 大尺寸抽屉 -->
      <zb-drawer
        v-model:visible="showLargeDrawer"
        title="大尺寸抽屉"
        size="large"
        @confirm="handleDrawerConfirm('大尺寸抽屉')"
      >
        <p>这是一个大尺寸的抽屉示例。</p>
        <p>适合展示复杂的信息或表单。</p>
      </zb-drawer>

      <!-- 表单抽屉 -->
      <zb-drawer
        v-model:visible="showFormDrawer"
        title="添加用户"
        :width="500"
        :confirm-loading="drawerFormLoading"
        @confirm="handleDrawerFormSubmit"
      >
        <zb-form
          ref="drawerFormRef"
          :model="drawerFormState"
          layout="vertical"
        >
          <zb-form-item label="用户名" required>
            <zb-input v-model:value="drawerFormState.username" placeholder="请输入用户名" />
          </zb-form-item>
          <zb-form-item label="真实姓名">
            <zb-input v-model:value="drawerFormState.realName" placeholder="请输入真实姓名" />
          </zb-form-item>
          <zb-form-item label="性别">
            <zb-radio-group v-model:value="drawerFormState.gender">
              <zb-radio value="male">男</zb-radio>
              <zb-radio value="female">女</zb-radio>
            </zb-radio-group>
          </zb-form-item>
          <zb-form-item label="部门">
            <zb-select
              v-model:value="drawerFormState.department"
              placeholder="请选择部门"
              style="width: 100%"
            >
              <a-select-option value="dev">研发部</a-select-option>
              <a-select-option value="test">测试部</a-select-option>
              <a-select-option value="pm">产品部</a-select-option>
              <a-select-option value="design">设计部</a-select-option>
            </zb-select>
          </zb-form-item>
          <zb-form-item label="备注">
            <zb-textarea
              v-model:value="drawerFormState.remark"
              placeholder="请输入备注信息"
              :rows="4"
            />
          </zb-form-item>
        </zb-form>
      </zb-drawer>

      <!-- 自定义底部按钮抽屉 -->
      <zb-drawer
        v-model:visible="showCustomButtonsDrawer"
        title="自定义底部按钮"
        :footerButtons="customButtons"
        @button-click="handleCustomButtonClick"
      >
        <p>这个抽屉使用了自定义底部按钮配置。</p>
        <p>通过 footerButtons 属性可以自定义底部按钮的文本、类型、加载状态等。</p>
        <p>这个示例自定义了三个按钮：取消、保存草稿和提交。</p>
      </zb-drawer>

      <!-- 左右分布按钮抽屉 -->
      <zb-drawer
        v-model:visible="showLeftRightButtonsDrawer"
        title="左右布局按钮"
        :footerButtons="leftRightButtons"
        @button-click="handleCustomButtonClick"
      >
        <p>这个抽屉展示了左右两侧布局的按钮。</p>
        <p>通过设置按钮的 position 属性为 'left' 或 'right'，可以控制按钮在底部区域的位置。</p>
        <p>帮助按钮放在左侧，操作按钮放在右侧，符合用户的直觉认知。</p>
      </zb-drawer>

      <!-- 自定义动作按钮抽屉 -->
      <zb-drawer
        v-model:visible="showCustomActionButtonsDrawer"
        title="自定义按钮动作"
        :footerButtons="actionButtons"
        @button-click="handleCustomButtonClick"
      >
        <p>这个抽屉展示了如何为按钮配置自定义动作。</p>
        <p>每个按钮可以:</p>
        <ul>
          <li>设置点击后是否自动关闭抽屉 (closeDrawer)</li>
          <li>通过 loading 属性控制加载状态</li>
          <li>通过 disabled 属性控制禁用状态</li>
          <li>通过 onClick 回调函数执行自定义逻辑</li>
        </ul>
        <p>点击"开始处理"按钮会进入加载状态3秒。</p>
      </zb-drawer>
    </div>

    <!-- 树形选择弹窗组件 -->
    <div class="demo-section">
      <h2 class="section-title">树形选择弹窗 zb-tree-select-modal</h2>
      
      <div class="demo-item">
        <h3>表单控件模式（单选）</h3>
        <div class="demo-row">
          <div style="display: flex; gap: 10px;">
            <div style="width: 300px; border: 1px solid #d9d9d9; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; height: 28px; line-height: 28px;">
              {{ singleSelectLabel || '请选择部门' }}
            </div>
            <zb-button type="primary" @click="showSingleSelectModal = true">选择</zb-button>
            
            <!-- 单选弹窗 -->
            <zb-tree-select-modal
              v-model="singleSelectValue"
              v-model:open="showSingleSelectModal"
              title="选择部门（单选）"
              :asFormControl="false"
              :data="treeData"
              :multiple="false"
              @change="handleSingleTreeChange"
              @confirm="handleSingleTreeConfirm"
            />
          </div>
          <p class="api-note">单选模式，选择一个部门</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>表单控件模式（单选-点击确认）</h3>
        <div class="demo-row">
          <div style="display: flex; gap: 10px;">
            <div style="width: 300px; border: 1px solid #d9d9d9; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; height: 28px; line-height: 28px;">
              {{ singleSelectNoAutoLabel || '请选择部门' }}
            </div>
            <zb-button type="primary" @click="showSingleSelectNoAutoModal = true">选择</zb-button>
            
            <!-- 单选但需点击确认的弹窗 -->
            <zb-tree-select-modal
              v-model="singleSelectNoAutoValue"
              v-model:open="showSingleSelectNoAutoModal"
              title="选择部门（需点击确认）"
              :asFormControl="false"
              :data="treeData"
              :multiple="false"
              :singleClickSelect="false"
              @change="handleSingleNoAutoTreeChange"
              @confirm="handleSingleNoAutoTreeConfirm"
            />
          </div>
          <p class="api-note">单选模式，但选择后需点击确认按钮才会关闭弹窗（singleClickSelect=false）</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>表单控件模式（多选）</h3>
        <div class="demo-row">
          <div style="display: flex; gap: 10px;">
            <div style="width: 300px; border: 1px solid #d9d9d9; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; height: 28px; line-height: 28px; overflow: hidden;">
              {{ multiSelectLabel || '请选择多个部门' }}
            </div>
            <zb-button type="primary" @click="showMultiSelectModal = true">选择</zb-button>
            
            <!-- 多选弹窗 -->
            <zb-tree-select-modal
              v-model="multiSelectTreeValue"
              v-model:open="showMultiSelectModal"
              title="选择部门（多选）"
              :asFormControl="false"
              :data="treeData"
              :multiple="true"
              :showCheckAll="true"
              @change="handleMultiTreeChange"
              @confirm="handleMultiTreeConfirm"
            />
          </div>
          <p class="api-note">多选模式，支持选择多个部门</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>表单控件模式（多选-父子节点独立）</h3>
        <div class="demo-row">
          <div style="display: flex; gap: 10px;">
            <div style="width: 300px; border: 1px solid #d9d9d9; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; height: 28px; line-height: 28px; overflow: hidden;">
              {{ strictlyMultiSelectLabel || '请选择多个部门' }}
            </div>
            <zb-button type="primary" @click="showStrictlyMultiSelectModal = true">选择</zb-button>
            
            <!-- 父子节点独立的多选弹窗 -->
            <zb-tree-select-modal
              v-model="strictlyMultiSelectTreeValue"
              v-model:open="showStrictlyMultiSelectModal"
              title="选择部门（父子节点独立）"
              :asFormControl="false"
              :data="treeData"
              :multiple="true"
              :showCheckAll="true"
              :checkStrictly="true"
              @change="handleStrictlyMultiTreeChange"
              @confirm="handleStrictlyMultiTreeConfirm"
            />
          </div>
          <p class="api-note">多选模式，但父子节点选择状态相互独立（checkStrictly=true），选中父节点不会自动选中子节点</p>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>按钮模式</h3>
        <div class="demo-row">
          <zb-tree-select-modal
            v-model:open="showCustomTreeModal"
            :asFormControl="false"
            title="选择项目部门"
            :data="treeData"
            :selectedValues="customSelectedTreeValues"
            @confirm="handleCustomTreeConfirm"
            @cancel="handleCustomTreeCancel"
          />
          <div>
            <div>
              <zb-button type="primary" @click="showCustomTreeModal = true">打开选择弹窗</zb-button>
            </div>
          </div>
          <div>已选择: {{ selectedTreesText }}</div>
        </div>
      </div>
      
      <div class="demo-item">
        <h3>在搜索表单中使用（搜索字段渲染方式）</h3>
        <div class="demo-row">
          <zb-search-form
            :fields="treeSelectSearchFields"
            :initial-values="treeSelectSearchValues"
            @search="handleSearchWithTreeSelect"
            @reset="handleSearchReset"
          />
          <p class="api-note">通过搜索表单的自定义渲染函数集成，与User.vue中相同的使用方式</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import TableDemo from "./TableDemo.vue";
import TableBasicDemo from "./TableBasicDemo.vue";
import { v4 as uuidv4 } from "uuid";

// 弹框状态
const showBasicModal = ref(false);
const showFormModal = ref(false);
const showWideModal = ref(false);
const showConfirmModal = ref(false);
const showNoFooterModal = ref(false);
const showTreeSelectModal = ref(false);
const showCustomTreeModal = ref(false);

// 弹框相关状态
const formSubmitLoading = ref(false);
const confirmLoading = ref(false);

// 表单数据
const modalFormState = reactive({
  name: "",
  type: "1",
});

// 树形选择弹窗数据
const treeData = ref([
  {
    title: "研发中心",
    key: "RD",
    personNum: 100,
    children: [
      {
        title: "产品文档部",
        key: "RD-DOC",
        personNum: 20,
        children: [
          { title: "产品组", key: "RD-DOC-PRODUCT", personNum: 5 },
          { title: "体验组", key: "RD-DOC-UX", personNum: 4 },
          { title: "设计组", key: "RD-DOC-DESIGN", personNum: 4 },
        ],
      },
      {
        title: "运维部",
        key: "RD-OPS",
        personNum: 20,
        children: [
          { title: "运维组", key: "RD-OPS-TEAM", personNum: 5 },
          { title: "网络组", key: "RD-OPS-NETWORK", personNum: 5 },
        ],
      },
      {
        title: "开发部",
        key: "RD-DEV",
        personNum: 60,
        children: [
          { title: "前端组", key: "RD-DEV-FRONTEND", personNum: 10 },
          { title: "后端组", key: "RD-DEV-BACKEND", personNum: 15 },
          { title: "测试组", key: "RD-DEV-QA", personNum: 10 },
        ],
      },
    ],
  },
  {
    title: "行政中心",
    key: "ADM",
    personNum: 60,
    children: [
      { title: "人事部", key: "ADM-HR", personNum: 10 },
      { title: "财务部", key: "ADM-FIN", personNum: 20 },
      { title: "行政部", key: "ADM-OFFICE", personNum: 30 },
    ],
  },
]);

const selectedTreeValues = ref([]);

// 树形选择处理函数
const handleTreeSelectConfirm = (keys, tags) => {
  selectedTreeValues.value = keys;
  message.success(`已选择 ${tags.length} 个部门`);
  showTreeSelectModal.value = false;
};

const handleTreeSelectCancel = () => {
  message.info("已取消选择");
  showTreeSelectModal.value = false;
};

// 弹框确认处理
const handleModalConfirm = (type) => {
  message.success(`${type}弹框确认成功`);
};

// 表单提交处理
const handleFormSubmit = () => {
  if (!modalFormState.name) {
    message.error("请输入产品名称");
    return;
  }

  formSubmitLoading.value = true;
  setTimeout(() => {
    formSubmitLoading.value = false;
    showFormModal.value = false;
    message.success("添加成功");
  }, 1000);
};

// 确认操作处理
const handleConfirmAction = () => {
  confirmLoading.value = true;
  setTimeout(() => {
    confirmLoading.value = false;
    showConfirmModal.value = false;
    message.success("操作成功");
  }, 800);
};

// 动态loading状态
const loading1 = ref(false);
const loading2 = ref(false);
const loading3 = ref(false);

// 切换loading状态
const toggleLoading = (loadingRef) => {
  // 切换指定的loading状态
  switch (loadingRef) {
    case "loading1":
      loading1.value = true;
      setTimeout(() => {
        loading1.value = false;
      }, 2000);
      break;
    case "loading2":
      loading2.value = true;
      setTimeout(() => {
        loading2.value = false;
      }, 2000);
      break;
    case "loading3":
      loading3.value = true;
      setTimeout(() => {
        loading3.value = false;
      }, 2000);
      break;
  }
};

// 输入框相关数据
const inputValue = ref("");
const countInputValue = ref("");
const textareaValue = ref("");
const countTextareaValue = ref("");

// 选择器相关数据
const selectValue = ref(undefined);
const multiSelectValue = ref([]);
const selectOptions = [
  { label: "选项1", value: "1" },
  { label: "选项2", value: "2" },
  { label: "选项3", value: "3" },
  { label: "选项4", value: "4" },
  { label: "选项5", value: "5" },
];

// 日期选择器相关数据
const dateValue = ref(null);
const dateTimeValue = ref(null);

// 复选框相关数据
const checkboxValue1 = ref(false);
const checkboxValue2 = ref(true);
const checkboxGroupValue = ref(["1", "3"]);
const checkOptions = [
  { label: "选项A", value: "1" },
  { label: "选项B", value: "2" },
  { label: "选项C", value: "3" },
  { label: "选项D", value: "4" },
];

// 单选按钮相关数据
const radioValue1 = ref(true);
const radioValue2 = ref(false);
const radioGroupValue = ref("1");
const radioButtonValue = ref("a");
const radioOptions = [
  { label: "选项A", value: "1" },
  { label: "选项B", value: "2" },
  { label: "选项C", value: "3" },
];

// 搜索表单相关数据
const searchFields = [
  {
    field: "keyword",
    label: "关键词",
  },
  {
    field: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "1" },
      { label: "警告", value: "2" },
      { label: "异常", value: "3" },
    ],
  },
  {
    field: "date",
    label: "日期",
    type: "date",
  },
  {
    field: "type",
    label: "类型",
    type: "select",
    options: [
      { label: "类型A", value: "A" },
      { label: "类型B", value: "B" },
      { label: "类型C", value: "C" },
    ],
  },
];

const searchInitialValues = {
  keyword: "",
  status: "",
  date: null,
  type: "",
};

// 事件处理函数
const handleSearch = (values) => {
  console.log("搜索提交:", values);
};

// 文件上传相关状态
const uploadFileList = ref([]);
const multiUploadFileList = ref([]);
const pdfFileList = ref([]);
const readonlyFileList = ref([]);

// 添加演示文件
const addDemoFile = () => {
  const demoFile = {
    id: uuidv4(),
    uid: uuidv4(),
    name: "演示文件.pdf",
    status: "done",
    fileType: "pdf",
    url: "",
  };

  readonlyFileList.value = [demoFile];
  message.success("已添加演示文件");
};

// Tab组件相关状态
const activeTab = ref("todo");
const configTab = ref("tab1");
const tabItems = [
  { key: "tab1", label: "选项卡1" },
  { key: "tab2", label: "选项卡2" },
  { key: "tab3", label: "选项卡3" },
];

// Tab切换事件处理
const handleTabChange = (activeKey) => {
  message.info(`切换到选项卡: ${activeKey}`);
};

// 抽屉相关状态
const showBasicDrawer = ref(false);
const showLeftDrawer = ref(false);
const showTopDrawer = ref(false);
const showBottomDrawer = ref(false);
const showSmallDrawer = ref(false);
const showDefaultDrawer = ref(false);
const showLargeDrawer = ref(false);
const showFormDrawer = ref(false);
const drawerFormLoading = ref(false);
const drawerFormState = reactive({
  username: "",
  realName: "",
  gender: "male",
  department: "dev",
  remark: "",
});

// 新增自定义按钮抽屉状态
const showCustomButtonsDrawer = ref(false);
const showLeftRightButtonsDrawer = ref(false);
const showCustomActionButtonsDrawer = ref(false);
const processingLoading = ref(false);

// 自定义底部按钮配置
const customButtons = ref([
  {
    text: "取消",
    type: "default",
    key: "cancel",
    closeDrawer: true
  },
  {
    text: "保存草稿",
    type: "default",
    key: "draft"
  },
  {
    text: "提交",
    type: "primary",
    key: "submit"
  }
]);

// 左右分布按钮配置
const leftRightButtons = ref([
  {
    text: "帮助",
    type: "default",
    key: "help",
    position: "left"
  },
  {
    text: "详细信息",
    type: "default",
    key: "details",
    position: "left"
  },
  {
    text: "取消",
    type: "default",
    key: "cancel",
    closeDrawer: true
  },
  {
    text: "确定",
    type: "primary",
    key: "confirm",
    closeDrawer: true
  }
]);

// 自定义动作按钮配置
const actionButtons = reactive([
  {
    text: "返回",
    type: "default",
    key: "back",
    closeDrawer: true
  },
  {
    text: "预览",
    type: "default",
    key: "preview",
    onClick: () => {
      message.info("正在预览内容...");
    }
  },
  {
    text: "开始处理",
    type: "primary",
    key: "process",
    get loading() { return processingLoading.value; },
    onClick: () => {
      processingLoading.value = true;
      message.loading("正在处理中...");
      
      setTimeout(() => {
        processingLoading.value = false;
        message.success("处理完成！");
      }, 3000);
    }
  }
]);

// 抽屉处理函数
const handleDrawerConfirm = (type) => {
  message.success(`${type}抽屉确认成功`);
};

const handleDrawerFormSubmit = () => {
  drawerFormLoading.value = true;
  setTimeout(() => {
    drawerFormLoading.value = false;
    showFormDrawer.value = false;
    message.success("表单提交成功");
  }, 1000);
};

// 处理自定义按钮点击
const handleCustomButtonClick = (button) => {
  // 根据按钮的key处理不同的逻辑
  const key = typeof button === 'object' ? button.key : button;
  
  switch (key) {
    case 'draft':
      message.success("已保存为草稿");
      showCustomButtonsDrawer.value = false;
      break;
    case 'submit':
      message.success("提交成功");
      showCustomButtonsDrawer.value = false;
      break;
    case 'help':
      message.info("这是帮助信息，可提供操作指引");
      break;
    case 'details':
      message.info("显示详细信息...");
      break;
    case 'cancel':
      message.info("已取消操作");
      break;
    case 'confirm':
      message.success("确认成功");
      break;
    default:
      if (typeof button === 'object' && button.text) {
        message.info(`点击了按钮: ${button.text}`);
      } else {
        message.info(`点击了按钮: ${key}`);
      }
  }
};

// 树形选择弹窗相关状态
const singleSelectValue = ref(null);
const multiSelectTreeValue = ref([]);
const customSelectedTreeValues = ref([]);
const selectedTreesText = ref("");
const showSingleSelectModal = ref(false);
const showSingleSelectNoAutoModal = ref(false);
const showMultiSelectModal = ref(false);
const showStrictlyMultiSelectModal = ref(false);
const singleSelectLabel = ref("");
const singleSelectNoAutoValue = ref('');
const singleSelectNoAutoLabel = ref('');
const multiSelectLabel = ref("");
const strictlyMultiSelectTreeValue = ref([]);
const strictlyMultiSelectLabel = ref('');

// 树形选择弹窗处理函数
const handleSingleTreeChange = (value, label) => {
  console.log('单选值变更:', value, label);
};

const handleMultiTreeChange = (value, label) => {
  console.log('多选值变更:', value, label);
};

const handleSingleTreeConfirm = (keys, tags) => {
  if (tags && tags.length > 0) {
    singleSelectLabel.value = tags[0].label;
  }
  message.success(`已选择: ${singleSelectLabel.value}`);
};

const handleMultiTreeConfirm = (keys, tags) => {
  if (tags && tags.length > 0) {
    multiSelectLabel.value = tags.map(tag => tag.label).join(', ');
    if (tags.length > 2) {
      multiSelectLabel.value = `${tags[0].label}, ${tags[1].label} 等${tags.length}项`;
    }
  } else {
    multiSelectLabel.value = '';
  }
  message.success(`已选择: ${multiSelectLabel.value || '无'}`);
};

const handleCustomTreeConfirm = (keys, tags) => {
  customSelectedTreeValues.value = keys;
  selectedTreesText.value = tags.map(tag => tag.label).join(', ');
  message.success(`已选择 ${tags.length} 个部门`);
  showCustomTreeModal.value = false;
};

const handleCustomTreeCancel = () => {
  message.info("已取消选择");
  showCustomTreeModal.value = false;
};

// 单选树形选择弹窗-点击确认类型
const handleSingleNoAutoTreeChange = (value, label) => {
  singleSelectNoAutoValue.value = value;
  singleSelectNoAutoLabel.value = label;
};

const handleSingleNoAutoTreeConfirm = (keys, tags) => {
  if (tags && tags.length > 0) {
    singleSelectNoAutoLabel.value = tags[0].label;
    message.success(`已选择: ${tags[0].label}`);
  }
};

// 严格模式多选树形选择
const handleStrictlyMultiTreeChange = (values, labels) => {
  strictlyMultiSelectTreeValue.value = values;
  strictlyMultiSelectLabel.value = labels;
};

const handleStrictlyMultiTreeConfirm = (keys, tags) => {
  if (tags && tags.length > 0) {
    strictlyMultiSelectLabel.value = tags.map(tag => tag.label).join(', ');
    message.success(`已选择: ${tags.length}个部门`);
  }
};

// 在搜索表单中使用（搜索字段渲染方式）
const formDeptSelectVisible = ref(false);
const formSelectedDeptId = ref('');
const formSelectedDeptName = ref('');
const formSelectedDeptKeys = ref([]);

// 处理部门变更事件
const handleFormDeptChange = (value, label) => {
  if (value === undefined || value === null || value === '') {
    formSelectedDeptId.value = '';
    formSelectedDeptName.value = '';
    formSelectedDeptKeys.value = [];
  } else {
    formSelectedDeptId.value = value;
    formSelectedDeptName.value = label;
    formSelectedDeptKeys.value = [value];
  }
  
  console.log('部门选择变更:', value, label);
  message.info(`已选择部门: ${label || '无'}`);
};

const treeSelectSearchFields = [
  {
    field: "keyword",
    label: "关键词",
  },
  {
    field: "deptId",
    label: "部门",
    type: "custom", // 自定义类型
    render: () => {
      return {
        component: 'zb-tree-select-modal',
        props: {
          asFormControl: true,
          modelValue: formSelectedDeptId.value,
          displayText: formSelectedDeptName.value,
          placeholder: '请选择所属部门',
          data: treeData.value,
          selectedValues: formSelectedDeptKeys.value,
          checkStrictly: true,
          open: formDeptSelectVisible.value,
          multiple: false,
          allowClear: true
        },
        on: {
          change: handleFormDeptChange,
          'update:modelValue': (val) => {
            formSelectedDeptId.value = val;
          },
          'update:open': (val) => {
            formDeptSelectVisible.value = val;
          }
        }
      }
    }
  },
  {
    field: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "1" },
      { label: "警告", value: "2" },
      { label: "异常", value: "3" },
    ],
  },
  {
    field: "date",
    label: "日期",
    type: "date",
  },
  {
    field: "type",
    label: "类型",
    type: "select",
    options: [
      { label: "类型A", value: "A" },
      { label: "类型B", value: "B" },
      { label: "类型C", value: "C" },
    ],
  },
];

const treeSelectSearchValues = {
  keyword: "",
  status: "",
  date: null,
  type: "",
};

const handleSearchWithTreeSelect = (values) => {
  console.log("搜索提交:", values);
  // 显示搜索参数
  message.success(`搜索参数: ${JSON.stringify(values)}`);
};

const handleSearchReset = () => {
  console.log("搜索重置");
  // 重置部门选择
  formSelectedDeptId.value = '';
  formSelectedDeptName.value = '';
  formSelectedDeptKeys.value = [];
  message.info('重置搜索条件成功');
};
</script>

<style lang="less" scoped>
@import "../../assets/styles/design-tokens.less";

.components-demo {
  background-color: #f1f3f8;
  min-height: 100vh;
}

.demo-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 500;
  color: #040849;
}

.demo-section {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin-bottom: 16px;
  padding-bottom: 16px;
  font-size: 18px;
  font-weight: 500;
  color: #040849;
  border-bottom: 1px solid #f0f0f0;
}

.demo-item {
  margin-bottom: 24px;

  h3 {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
    color: #040849;
  }
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.icon-placeholder {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-color: currentColor;
  opacity: 0.5;
  margin-right: 4px;
  border-radius: 2px;
}

.view-details {
  .detail-item {
    margin-bottom: 16px;
    display: flex;

    .label {
      width: 100px;
      color: #666;
      text-align: right;
      margin-right: 12px;
    }

    .value {
      flex: 1;
    }
  }
}

.tab-content {
  padding: 16px;
  border-radius: 4px;
  min-height: 120px;

  p {
    margin-bottom: 8px;
    font-size: 14px;
  }

  ul {
    list-style: none;
    padding-left: 0;

    li {
      position: relative;
      padding-left: 16px;
      line-height: 28px;
      color: #333;
      font-size: 14px;

      &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #364fc7;
      }
    }
  }
}

.design-tabs-nav {
  display: flex;
  margin-bottom: 8px;

  .design-tab {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 16px;
    color: #0f1948;
    position: relative;
    text-align: center;

    &.active {
      color: #ffffff;
      font-weight: 500;
      background-color: #364fc7;
      border-radius: 4px;
    }
  }
}

.api-note {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  font-style: italic;
}
</style>
