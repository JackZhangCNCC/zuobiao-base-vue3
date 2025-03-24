// 获取字典数据
const fetch = async (params = {}) => {
  loading.value = true;

  try {
    const { data } = await get("auth/dict", {
      ...params
    });

    // 使用统一的响应处理函数
    if (handleResponse(data, null, '获取字典列表失败')) {
      // 使用与Vue2项目相同的数据路径
      dataSource.value = data.data.rows.children;
      defaultExpandedRowKeys.value = [];
    } else {
      dataSource.value = [];
    }
  } catch (error) {
    console.error('获取字典列表失败', error);
    message.error('获取字典列表失败');
    dataSource.value = [];
  } finally {
    loading.value = false;
  }
}
