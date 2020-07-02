;(function() {
  var root = window;
  var ArrayProto = Array.prototype,  push = ArrayProto.push;
  var $yzg = function(obj) {
      if (obj instanceof $yzg) return obj;
      if (!(this instanceof $yzg)) return new $yzg(obj);
      this._wrapped = obj;
  };
  window.$yzg = $yzg;

  $yzg.VERSION = '0.0.1';
  // 小程序支付页面的路径  
  var MINI_PAGE = '/pages/demo/demo';
  // sdk 核心接口 map
  var JS_SDK_MAP = {
    /** 
    * 调起小程序支付页面
    */
    miniPay: function (obj) {
        if (obj && $yzg.objToSearch(obj.data)) {
            if (root.wx && wx.miniProgram && wx.miniProgram.navigateTo) {
                wx.miniProgram.navigateTo({
                    url: MINI_PAGE + '?' + $yzg.objToSearch(obj.data)
                })
                obj.success && $yzg.isFunction(obj.success) && obj.success()
            } else {
                obj.fail && $yzg.isFunction(obj.fail) && obj.fail({code: 1001, msg: '当前环境不是微信小程序！'})
                console.error('当前环境不是微信小程序！');
                return false;
            }
        } else {
            obj && obj.fail && $yzg.isFunction(obj.fail) && obj.fail({code: 1000, msg: '请输入必填参数！'})
            console.error('请输入必填参数！');
            return false;
        }
    },
    /** 
    * 配置小程序支付分享
    * 
    */
    miniShare: function(obj) {
        console.log('调起小程序支付分享页面');
        // 具体实现略
    },
    /** 
    * 调起APP支付页面
    */
    appPay: function(obj) {
        console.log('调起APP支付页面');
        // 具体实现略
    },
    /** 
    * 配置APP分享
    */
    appShare: function(obj) {
        console.log('配置APP分享');
        // 具体实现略
    },
  }
  // sdk 核心接口 list
  var JS_SDK_LIST = Object.keys(JS_SDK_MAP);

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  var isArrayLike = function(collection) {
      var length = collection.length;
      return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  $yzg.each = function(obj, callback) {
      var length, i = 0;
      if (isArrayLike(obj)) {
          length = obj.length;
          for (; i < length; i++) {
              if (callback.call(obj[i], obj[i], i) === false) {
                  break;
              }
          }
      } else {
          for (i in obj) {
              if (callback.call(obj[i], obj[i], i) === false) {
                  break;
              }
          }
      }
      return obj;
  }

  $yzg.isFunction = function(obj) {
      return typeof obj == 'function' || false;
  };

  $yzg.functions = function(obj) {
      var names = [];
      for (var key in obj) {
          if ($yzg.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
  };

  // 判断机型
  $yzg.getDevice = function () {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1) {
      return 'android'
    } else if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      return 'ios'
    }
  };

  // 判断是否在微信小程序环境
  $yzg.isMiniProEnv = function () {
    var ua = root.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
  };

  // 是否是一层对象，且无嵌套对象
  $yzg.isPrueObj = function (obj){
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        var vals = Object.values(obj);
        var isPrueObj = vals.every(function(v){
            return (typeof v !== 'object') && (typeof v !== 'function') && (typeof v !== 'undefined')
        })
        return isPrueObj;
    } else {
        return false
    }
  }

  // 把obj 转为 search
  $yzg.objToSearch = function(obj) {
    if ($yzg.isPrueObj(obj)) {
        if (Object.keys(obj).length) {
            var arr1 = Object.entries(obj), res = [];
            arr1.forEach(function(v){
                res.push(v.join('='));
            })
            return res.join('&');
        } else {
            return '';
        }
    } else {
        return false
    }
  }

  /**  
   * 发布订阅模式
  */
  $yzg.event = {
      list: {},
      on(key, fn) {
          if (!this.list[key]) {
              this.list[key] = [];
          }
          this.list[key].push(fn);
      },
      emit() {
          let key = [].shift.call(arguments),
              fns = this.list[key];

          if (!fns || fns.length === 0) {
              return false;
          }
          fns.forEach(fn => {
              fn.apply(this, arguments);
          });
      },
      remove(key, fn) {
          let fns = this.list[key];
          if (!fns) return false;
          if (!fn) {
              fns && (fns.length = 0);
          } else {
              fns.forEach((cb, i) => {
                  if (cb === fn) {
                      fns.splice(i, 1);
                  }
              });
          }
      }
  }

  /** 
   * 打印信息封装
  */
  $yzg.logGrd = function (str, obj) {
    var date = new Date();
    console.group(date + ' ' + str);
    obj && console.log(obj);
    console.groupEnd();
  }

  /** 
   * sdk基础配置
   * 参数： object
   * debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
   * appKey: '', // 必填，企业号的唯一标识
   * timestamp: '', // 必填，生成签名的时间戳
   * nonceStr: '', // 必填，生成签名的随机串
   * skdApiList: [] // 必填，需要使用的JS接口列表
   */
  $yzg.config = function(obj) {
    if (!obj || !obj.appKey || !obj.timestamp || !obj.nonceStr || !obj.skdApiList.length) {
      console.error('请输入SDK的基础配置信息！');
      return
    }
    $yzg.logGrd('$yzg.config begin', obj);
    $yzg.checkConfig(obj)
  }

  /** 
  *  检测该商户有没有这些API的权限
  */
  $yzg.checkConfig = function (obj) {
    setTimeout(function(){
      // 后期会改成ajax的请求结果 
      if (0.5 > Math.random()) {
        $yzg.register(obj.skdApiList)
      } else {
        $yzg.register(obj.skdApiList)
      }
    }, 0)
  }
  
  /** 
  * SDK请求成功
  */
  $yzg.ready = function (callback) {
    if ($yzg.isFunction(callback)) {
      $yzg.event.on('ready', (res) => {
        $yzg.logGrd('$yzg.config end', res);
        callback()
      });
    } else {
      console.error('$yzg.ready()的参数应该是一个函数!');
    }
  }
  /** 
  * SDK权限注册
  */
  $yzg.register = function (arr) {
     var registerApi = [];
     JS_SDK_LIST.forEach(function (api) {
         if (arr.indexOf(api) !== -1) {
            ($yzg[api] = JS_SDK_MAP[api]) && registerApi.push(api)
         } else {
            $yzg[api] = function() {
                console.error('你没有调用$yzg.' + api + '的权限，请检查有没有注册此API！')
            }
         }
     });
     $yzg.event.emit('ready', {msg: 'OK', jsSdkList: registerApi})
     $yzg.logGrd('当前页面通过 $yzg.config 获取到的 JSSDK 权限如下', registerApi);
  }

  /** 
  * SDK请求失败
  */
  $yzg.error = function (callback) {
    if ($yzg.isFunction(callback)) {
      $yzg.event.on('error', (res) => {
        $yzg.logGrd('$yzg.config end', res);
        callback()
      });
    } else {
      console.error('$yzg.error()的参数应该是一个函数!');
    }
  }
  
  /**
   * 在 $yzg.mixin($yzg) 前添加自己定义的方法
   */
  $yzg.mixin = function(obj) {
    $yzg.each($yzg.functions(obj), function(name) {
          var func = $yzg[name] = obj[name];
          $yzg.prototype[name] = function() {
              var args = [this._wrapped];
              push.apply(args, arguments);
              return func.apply($yzg, args);
          };
      });
      return $yzg;
  };
  $yzg.mixin($yzg);
})()