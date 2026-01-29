```json
{
  "示例场景": "商品档案表单",
  "输入字段": ["商品编码", "商品名称", "分类", "价格"],
  "输出结构": {
    "id": "goods_page",
    "name": "商品档案表单",
    "rootComponentIds": ["goods_form"],
    "components": {
      "goods_form": {
        "id": "goods_form",
        "parentId": "goods_page",
        "type": "EvelatorForm",
        "props": {
          "name": "电梯表单",
          "label": "表单容器"
        },
        "children": ["goods_base_form", "goods_b2b_form", "goods_b2c_form"]
      },
      "goods_base_form": {
        "id": "goods_base_form",
        "parentId": "goods_form",
        "type": "Form",
        "props": {
          "label": "基本信息",
          "name": "通用表单",
          "tabLayout": 2,
          "labelPos": "left",
          "labelAlign": 0
        },
        "children": [""]
      },
      "goods_b2b_form": {
        "id": "goods_b2b_form",
        "parentId": "goods_form",
        "type": "Form",
        "props": {
          "label": "B2B信息",
          "name": "通用表单",
          "tabLayout": 2,
          "labelPos": "left",
          "labelAlign": 0
        },
        "children": ["order_bussiness_text", "b2b_category_text"]
      },
      "goods_b2c_form": {
        "id": "goods_b2c_form",
        "parentId": "goods_form",
        "type": "Form",
        "props": {
          "label": "B2C信息",
          "name": "通用表单",
          "tabLayout": 2,
          "labelPos": "left",
          "labelAlign": 0
        },
        "children": ["b2c_sort_text", "b2c_category_text"]
      },
      "product_code_text": {
        "id": "product_code_text",
        "parentId": "goods_base_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "商品编码",
          "size": 1
        },
        "children": []
      },
      "produce_name_text": {
        "id": "produce_name_text",
        "parentId": "goods_base_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "商品名称",
          "size": 1
        },
        "children": []
      },
      "order_bussiness_text": {
        "id": "order_bussiness_text",
        "parentId": "goods_b2b_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "订货单位",
          "size": 1
        },
        "children": []
      },
      "b2b_category_text": {
        "id": "b2b_category_text",
        "parentId": "goods_b2b_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "B2B分类",
          "size": 1
        },
        "children": []
      },
      "b2c_sort_text": {
        "id": "b2c_sort_text",
        "parentId": "goods_b2c_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "B2C排序",
          "size": 1
        },
        "children": []
      },
      "b2c_category_text": {
        "id": "b2c_category_text",
        "parentId": "goods_b2c_form",
        "type": "Text",
        "props": {
          "name": "输入框",
          "label": "B2C分类",
          "size": 1
        },
        "children": []
      }
    }
  }
}
```
