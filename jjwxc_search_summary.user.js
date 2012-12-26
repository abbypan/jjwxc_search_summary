// --------------------------------------------------------------------
//
// ==UserScript==
// @name          jjwxc-search-summary 
// @namespace     http://abbypan.github.com/
// @description   绿晋江( http://www.jjwxc.net )搜索结果添加积分信息
// @author        Abby Pan (abbypan@gmail.com)
// @homepage      http://abbypan.github.com/
// @copyright     2009+, Abby Pan (http://abbypan.github.com/)
// @version       0.2
// @require		  http://userscripts.org/scripts/source/44063.user.js
// @include       http://www.jjwxc.net/search.php?kw=*
// ==/UserScript==
//
// --------------------------------------------------------------------

var LjjSearch = new Class({
	initialize: function(){
					this.url=document.location.href;
					this.charset=document.characterSet;
				},
	formatSearchSummary : function(){

							  var banner = new Element('p', {id: 'refineInfo'});
							  banner.set('style','color:red');
							  banner.set('text','正在取第 ');
							  banner.inject($('search_result'),'before');

							  var bookID = new Element('span', {id: 'bookID'});
							  bookID.set('text',0);
							  banner.adopt(bookID);
							  banner.appendText(' 本，共 ');

							  var books=$('search_result').getElements('h3[class="title"]');        
							  var num = books.length;

							  var bookNum = new Element('span', {id: 'bookNum'});
							  bookNum.set('text',num);
							  banner.adopt(bookNum);
							  banner.appendText(' 本');

							  if(num > 0){
								  this.formatBook(books);
							  }
						  },
	getWordNum : function(page){
					 var lis = page.getElement('ul[name="printright"]').getElements('li');
					 var wordNum= lis[4].get('text');
					 var m=wordNum.match(/([0-9]+)[^0-9]+$/);
					 return m.length>0?m[1]:null;
				 },
	getPoint : function(page){
				   var div = page.getElement('div[style="padding-top: 50px;"]');
				   if(!div){
					   div = (page.getElements('td[class="sptd"]'))[1];
				   }
				   if(!div) return;
				   var point = div.get('text');
				   var m=point.match(/([0-9,]+)[^0-9]+$/);
				   return m.length>0?m[1].replace(/,/g,""):null;
			   },
	addBookPointInfo : function(thisBook,wordNum,Point){
						   if(!thisBook) return;
						   var pointPerWord = calcPoint(wordNum, Point);
						   var info = new Element('span');
						   info.set('style','color:red;font-size:small;');
						   info.set('text',' [ 字数: '+wordNum+' | 积分: '+Point+' | 积分/字: '+pointPerWord+' ]');

						   thisBook.adopt(info);
					   },
	formatBook: function(books){
					var bookID = $('bookID').get('text').toInt() + 1;
					var bookNum = $('bookNum').get('text').toInt();

					if(bookID > bookNum){
						$('refineInfo').parentNode.removeChild($('refineInfo'));
						return;
					}

					$('bookID').set('text',bookID);

					var thisBook=books[bookID-1];
					var url=thisBook.getElement('a').get('href');

					var self=this;
					GM_xmlhttpRequest({
						method: "GET",
						url: url,
						'overrideMimeType':"text/html; charset="+self.charset,
						onload: function(res) {
							var page = new Element('div');
							page.innerHTML = res.responseText;
							var wordNum = self.getWordNum(page);
							var Point = self.getPoint(page);
							self.addBookPointInfo(thisBook,wordNum,Point);
							self.formatBook(books);
						},
						onerror : function(res){
									  self.formatBook(books);
								  },
					});
				},

});

function calcPoint ( wordNum , point ) {
	//计算平均积分
	if(wordNum == 0 )
		return "0";
	var newPoint = (point/wordNum+0.5) + ""; 
	return newPoint.replace(/\.[0-9]+/,"");
}


function getSearchSummary(){
	var result = new LjjSearch();
	if(!result) return;
	result.formatSearchSummary();
}

getSearchSummary();
