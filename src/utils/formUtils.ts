/**
 * 重置对象属性值
 * @param obj 要重置的对象
 * @param defaultValues 默认值对象
 */
export const resetObjectValues = (obj: any, defaultValues: Record<string, any> = {}) => {
  if (!obj) return;
  
  // 先清空所有属性
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = '';
    } else if (typeof obj[key] === 'boolean') {
      obj[key] = false;
    } else if (Array.isArray(obj[key])) {
      obj[key] = [];
    } else if (typeof obj[key] === 'number') {
      obj[key] = 0;
    } else {
      obj[key] = undefined;
    }
  });
  
  // 再使用默认值覆盖
  if (defaultValues && typeof defaultValues === 'object') {
    Object.keys(defaultValues).forEach(key => {
      obj[key] = defaultValues[key];
    });
  }
};

/**
 * 重置表单值
 * @param form 表单对象
 * @param formValues 表单数据对象
 * @param defaultValues 默认值对象
 * @param keepFields 保持不变的字段列表
 */
export const resetFormValues = (
  form: any,
  formValues: any,
  defaultValues: Record<string, any> = {},
  keepFields: string[] = []
) => {
  if (form && form.resetFields) {
    form.resetFields();
  }
  
  if (formValues) {
    // 保存需要保持的字段值
    const keepValues: Record<string, any> = {};
    if (keepFields && keepFields.length > 0) {
      keepFields.forEach(field => {
        if (formValues[field] !== undefined) {
          keepValues[field] = formValues[field];
        }
      });
    }
    
    // 重置表单数据对象
    resetObjectValues(formValues, defaultValues);
    
    // 恢复需要保持的字段值
    Object.keys(keepValues).forEach(key => {
      formValues[key] = keepValues[key];
    });
  }
};

/**
 * 设置表单值
 * @param form 表单对象
 * @param values 要设置的值
 */
export const setFormValues = (form: any, values: Record<string, any>) => {
  if (!form || !values) return;
  
  if (form.setFieldsValue) {
    form.setFieldsValue(values);
  } else {
    // 如果没有setFieldsValue方法，直接设置属性
    Object.keys(values).forEach(key => {
      if (form[key] !== undefined) {
        form[key] = values[key];
      }
    });
  }
}; 