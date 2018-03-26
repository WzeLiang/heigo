$(function(){
	//判断是否是IE8以下版本浏览器
	var agent = navigator.userAgent;
	if(agent.indexOf("MSIE 6.0")>0){   
	    $('#IeHide').show();
	    alert("请使用IE9及以上版本浏览器");
	}   
	if(agent.indexOf("MSIE 7.0")>0){  
	    $('#IeHide').show();
	    alert("请使用IE9及以上版本浏览器");
	}   
	if(agent.indexOf("MSIE 9.0")>0 && !window.innerWidth){//重点
	    $('#IeHide').show();
	    alert("请使用IE9及以上版本浏览器");
	}    
	
	$('input, textarea').placeholder();
	$('.function').swTable();
	$('.banner').swBanner();
	$('#gg').addClass('selected');
 
	//验证登录状态
	if($('#hideUser').val() != null && $('#hideUser').val().trim() != ""){
		$('#topLogReg').hide();
		$('#rightLogin').hide();
		$('#exitLogin').show();
	}else{
		$('#exitLogin').hide();
		$('#rightLogin').show();
		$('#topLogReg').show();
	}
	
	//顶端登录按钮点击弹出登录框
	$('#topLogin').click(function(){
		if($('.login').is(":hidden") ){
			$('.login').css('width','53px'); 
		}else{
			$('.login').css('width','300px'); 
		}
		$('.logintable').toggle();
		$('#loginForm').toggle();
	});
	
	//bbs总条数
	total = 0;

	//初始化加载公告内容
	$.getJSON(ctx + '/bbsdata/bbsdata/getannouncedata.go', {page: 1, rows: 7},function(data){
		total = data.total;
        for (var i = 0; i < data.rows.length; i++) {
        	var li = $('<li class="contenttext">'+
		  					'<div id="'+ data.rows[i].bbsId+'" class="contentTitle">'+
		  						'<a onclick="openArticle1(this);" title="'+ data.rows[i].bbsText+ '" class="contentA">'+ data.rows[i].bbsText +'</a>'+
		  					'</div>'+
		  					'<div class="contentTime">'+
		  						'<span>'+ data.rows[i].submitTime.substr(5,5) +'</span>'+
		  					'</div>'+
        			   '</li>');
        	$('#contenttext').append(li);
        	li.fadeIn(500);
        }
    });
	
	//初始化加载新闻内容
	$.getJSON(ctx + '/resource/json/news.json', {},function(data){
        for (var i = 0; i < data.news.length; i++) {
        	var li = $('<li class="contenttext">'+
		  					'<div id="'+ data.news[i].newId+'" class="contentTitle">'+
		  						'<a onclick="openArticle2(this);" title="'+ data.news[i].newTitle+ '" class="contentA">'+ data.news[i].newTitle +'</a>'+
		  					'</div>'+
		  					'<div class="contentTime">'+
		  						'<span>'+ data.news[i].submitTime.substr(5,5) +'</span>'+
		  					'</div>'+
        			   '</li>');
        	$('#newtext').append(li);
        	li.fadeIn(500);
        }
    });
	
	//登录令牌
	$('#submitForm').click(function(){
		if($('#code').val().trim() != ''){
			$.ajax({
				type:'post',
				url: ctx + '/offical/offical/loginToken.go',
				data: {code: $("#code").val()},
				async:false,
				success:function(data){
					if(data.status == "-1"){
						$("#returnMsg").html('&#x2718  验证码错误').fadeIn();
						changeCode();
					}else{
						var phoneNumber = $("#phoneNumber").val();
						var password = $("#password").val();
						
						RSAUtils.setMaxDigits(200);  
						var key = new RSAUtils.getKeyPair(data.publicKeyExponent, "", data.publicKeyModulus);  
						var encrypedPnum = RSAUtils.encryptedString(key,phoneNumber+"");  
						var encrypedPwd = RSAUtils.encryptedString(key,password+"");  
						login(encrypedPnum,encrypedPwd);
					}
				},
				error:function(msg){
					$("#returnMsg").html('&#x2718 请求错误，请刷新页面').fadeIn();
					changeCode();
				}
			});
		}else{
			$("#returnMsg").html('&#x2718   请输入验证码').fadeIn();
		}
	});
	
	//退出登录
	$('#exit').click(function(){
		$('#hideUser').val('');
		$('#hideImage').val('');
		location.href = ctx + '/offical/offical/exit.go'; 
	});
	
	//选项表格
	$('.td').click(function(){ 
		$(this).addClass('selected').siblings('td').removeClass('selected');
	});
	
	//显示公告
	$('#gg').click(function(){ 
		$('.content').fadeIn();
		$('.news').hide();
		$('.bbs').hide();
	});
	
	//显示新闻
	$('#xw').click(function(){ 
		$('.content').hide();
		$('.news').fadeIn();
		$('.bbs').hide();
	});

	//显示吐槽
	$('#tc').click(function(){ 
		getBBSInfo();
		$('.content').hide();
		$('.news').hide();
		$('.bbs').fadeIn();
	});

	//换一批
	var count = 1;
	$('#refresh').click(function(){ 
		if(total%7 == 0){
			if(count >= total/7){
				count = 1;
			}else{
				count ++;
			}
		}else{
			if(count > (total - total%7)/7){
				count = 1;
			}else{
				count ++;
			}
		}
		$('#contenttext').children('li').remove();
		$.getJSON(ctx + '/bbsdata/bbsdata/getannouncedata.go', {page: count, rows: 7},function(data){
	        for (var i = 0; i < data.rows.length; i++) {
	            var li = $('<li class="contenttext">'+
	          					'<div id="'+ data.rows[i].bbsId +'" class="contentTitle">'+
	          						'<a onclick="openArticle1(this);" title="'+ data.rows[i].bbsText+ '" class="contentA">'+ data.rows[i].bbsText +'</a>'+
	          					'</div>'+
	          					'<div class="contentTime">'+
	          						'<span>'+ data.rows[i].submitTime.substr(5,5) +'</span>'+
	          					'</div>'+
	          			   '</li>');
	            $('#contenttext').append(li);
	            li.fadeIn(500);
	        }
	    });
		
	});
	
	//图片放大
	$w = $('#xwPic').width();
	$h = $('#xwPic').height();
	$w2 = $w + 30;
	$h2 = $h + 15;
	
	$('#xwPic,#ggPic').hover(function(){
		 $(this).stop().animate({height:$h2,width:$w2,left:'-7px',top:'-7px'},400);
	},function(){
		 $(this).stop().animate({height:$h,width:$w,left:'0px',top:'0px'},400);
	});
	
	//qq
	$('#qq').click(function(){ 
		$("#waitGif").show();
		setTimeout(function(){
			$("#waitGif").fadeOut();
			location.href='tencent://message/?uin=3128440868&amp;Site=www.heigo.com.cn&amp;Menu=yes';
		},2000);
	});

	//微信
	$('#wx').mouseover(function(){ 
		$('.logintable').hide();
		$('#loginForm').hide();
		$('#wxCodePic').show();
		$('.login').css('width','300px'); 
	});
	$('#wx').mouseout(function(){ 
		$('#wxCodePic').hide();
		$('.login').css('width','53px'); 
	});
	
	//微博
	$('#wb').mouseover(function(){ 
		$('.logintable').hide();
		$('#loginForm').hide();
		$('#wbCodePic').show();
		$('.login').css('width','300px'); 
	});
	$('#wb').mouseout(function(){ 
		$('#wbCodePic').hide();
		$('.login').css('width','53px'); 
	});

	//登录小图标
	$('#rightLogin').click(function(){ 
		if($('.login').is(":hidden") ){
			$('.login').css('width','53px'); 
		}else{
			$('.login').css('width','300px'); 
		}
		$('.logintable').toggle();
		$('#loginForm').toggle();
	});
	
	//android下载链接
	$('.android').click(function(){ 
		$.ajax({
			cache:true,
			type:'post',
			url: ctx + '/offical/offical/selectDownurl.go',
			async:false,
			success:function(data){
				window.location.href = data;
			},
			error:function(msg){
				alert("该链接暂不可用，请扫码下载");
			},
		});
	});
	
	//ios下载链接
	$('.ios').click(function(){ 
		window.open('http://itunes.apple.com/us/app/hei-gou-ban-wo-xing/id1090313321?mt=8',"_blank");
	});
	
});

	//登录
	function login(encrypedPnum,encrypedPwd) {
		$.ajax({
			cache:true,
			type:'post',
			url: ctx + '/offical/offical/login.go',
			data: {phoneNumber: encrypedPnum, password: encrypedPwd},
			async:false,
			success:function(data){
				if(data == 1){
					location.href= ctx + '/offical/offical/loginSuccess.go?page=0'; 
				}else if(data == 0){
					$("#returnMsg").html('&#x2718  用户名不能为空').fadeIn();
				}else{
					$("#returnMsg").html('&#x2718  用户名或密码输入错误').fadeIn();
					changeCode();
				}
			},
			error:function(msg){
				$("#returnMsg").html('&#x2718   用户名或密码输入错误').fadeIn();
				changeCode();
			},
		});
	}

	//刷新验证码
	function changeCode() {
		var url = ctx + '/util/util/captcha.go?timestamp=' + (new Date()).valueOf();
	    $('#captchaImg').attr('src',url);
	    $('#captchaImg1').attr('src',url);
	    $('#captchaImg2').attr('src',url);
	}
	
	//点击一下隐藏弹窗
	function hideDiv(){
		$('#downDiv1').hide();
		$('#downDiv2').hide();
	}
	
	//下载弹出二维码
	function openCode(){
		$('#downDiv1').fadeIn(500);
		$('#downDiv2').fadeIn(500);
		$('#downDiv1').css('z-index','999');
		$('#downDiv2').css('z-index','999');
	}
	
	//得到地址栏传过来的参数
	function GetQueryString(name){
	    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	    var r = window.location.search.substr(1).match(reg);
	    if(r!=null)
	    	return unescape(r[2]); 
	    return null;
	}
	
	//敬请期待，2秒后消失
	function waitMsg(){
		$('#waitMsg').show();
		setTimeout(function(){
			$('#waitMsg').fadeOut();
		},2000);
	}
	
	//轮播图
	(function ($) {
	   $.fn.swBanner = function(options){
	     var defaults = {
		     animateTime : 300,
			 delayTime : 5000
	   };
	   var setting = $.extend({},defaults,options);
	   
	   return this.each(function(){
	      $obj = $(this);
		  var o = setting.animateTime;
		  var d = setting.delayTime;
		  var $oban = $obj.find('.banList li');
		  var _len = $oban.length;
		  var $nav = $obj.find('.fomW a');
		  var _index = 0;
		  var timer;
		  //图片轮换
		  function showImg(n){
		     $oban.eq(n).addClass('active').siblings().removeClass('active');
			 $nav.eq(n).addClass('current').siblings().removeClass('current');
		  }
		  //自动播放
		  function player(){
		     timer = setInterval(function(){
			     var _index = $obj.find('.fomW').find('a.current').index();
			     showImg((_index+1)%_len);
			 },d);
		  }
		  //鼠标悬停停止播放
		  $('.banList li').hover(function(){
			  clearInterval(timer);
		  },function(){
		      player();
		  });

		  //导航按钮
		  $nav.hover(function(){
	         if(!($oban.is(':animated'))){
	             _index = $(this).index();
		         showImg(_index);
		     }
		     clearInterval(timer);
		  },function(){
		     player();
		  });
		  player();
	   });
	   
	   };
	})(jQuery);	
	
	//function的切换
	(function ($) {
		   $.fn.swTable = function(options){
		     var defaults = {
			     animateTime : 300,
				 delayTime : 6000
		   };
		   var setting = $.extend({},defaults,options);
		   
		   return this.each(function(){
		      $obj2 = $(this);
			  var o = setting.animateTime;
			  var d = setting.delayTime;
			  var $nav2 = $obj2.find('.table td');
			  var _index2 = 0;
			  var timer2;
			  //图片轮换
			  function showDiv(n){
				 $nav2.eq(n).addClass('selected').siblings().removeClass('selected');
				 if(n+1 == 1){
			 		 $('.content').fadeIn();
					 $('.news').hide();
					 $('.bbs').hide();
			     }else if(n+1 == 2){
			    	 $('.content').hide();
			    	 $('.news').fadeIn();
			    	 $('.bbs').hide();
			     }else if(n+1 == 3){
			    	 getBBSInfo();
			    	 $('.content').hide();
			    	 $('.news').hide();
			    	 $('.bbs').fadeIn();
			     }
			    
			  }
			  
			  //自动播放
			  function player(){
			     timer2 = setInterval(function(){
				     var _index2 = $obj2.find('.table').find('.selected').index();
				     showDiv((_index2+1)%3);
				 },d);
			  }
			  player();
			  
			  //用户浏览意愿标识
			  var flag = 0;
			  
			  //鼠标悬停停止播放
			  $('.content,.news,.bbs').hover(function(){
				  clearInterval(timer2);
			  },function(){
				  if(flag = 0){
					  player();
				  }
			  });
			  
			  $('#gg,#xw,#tc').click(function(){ 
				  flag = 1;
				  clearInterval(timer2);
			  });
			
		   });
		   
		   };
	})(jQuery);	
		
	(function(){
		//百度搜索自动收录
	    var bp = document.createElement('script');
	    var curProtocol = window.location.protocol.split(':')[0];
	    if (curProtocol === 'https'){
	    	bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
	    }else{
	    	bp.src = 'http://push.zhanzhang.baidu.com/push.js';
	    }
	    var s = document.getElementsByTagName("script")[0];
	    s.parentNode.insertBefore(bp, s);
	    
	    //360搜索自动收录
	    var src = (document.location.protocol == "http:") ? "http://js.passport.qihucdn.com/11.0.1.js?f17d0fb1f326a7e1eea79dea3413e9e9":"https://jspassport.ssl.qhimg.com/11.0.1.js?f17d0fb1f326a7e1eea79dea3413e9e9";
	    document.write('<script src="' + src + '" id="sozz"><\/script>');
	})();
	
	
	