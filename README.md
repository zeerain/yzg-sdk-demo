# 概述

仿微信JSSDK相关实现

## 使用说明

```bash
npm install

npm run build
```

### 步骤一：引入JS文件

在需要调用JS接口的页面引入此JS文件文件，

### 步骤二：通过config接口注入权限验证配置

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用

```js
$yzg.config({
  appKey: '', 
  timestamp: , 
  nonceStr: '', 
  skdApiList: ['miniPay', 'miniShare', 'appPay', 'appShare'] 
});
```

### 步骤三：通过ready接口处理成功验证

```js
$yzg.ready(function(){
   
});
```

### 步骤四：通过error接口处理失败验证

```js
$yzg.error(function(res){
    
});
```
## 接口调用说明

所有接口通过$yzg对象来调用，参数是一个对象，除了每个接口本身需要传的参数之外，还有以下通用参数：

1. success：接口调用成功时执行的回调函数。
2. fail：接口调用失败时执行的回调函数。