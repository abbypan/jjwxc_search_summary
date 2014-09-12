// --------------------------------------------------------------------
//
// ==UserScript==
// @name jjwxc_search_summary
// @namespace http://abbypan.github.com/
// @description 绿晋江( http://www.jjwxc.net )搜索结果添加积分信息
// @author Abby Pan (abbypan@gmail.com)
// @homepage http://abbypan.github.com/
// @copyright 2009+, Abby Pan (http://abbypan.github.com/)
// @version 0.4
// @include http://www.jjwxc.net/search.php?kw=*
// @grant         GM_xmlhttpRequest
// @require http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// ==/UserScript==
//
// --------------------------------------------------------------------
var url=document.location.href;
var charset=document.characterSet;

function mainSearchSummary(){
    var num = $('#search_result').find('h3[class="title"]').length;
    if(num<=0) return;

    var s = '<p id="refineInfo" style="color:red">正在取第<span id="bookID">0</span>本，共<span id="bookNum">'+
            num+'</span>本</p>';
    $(s).insertBefore('#search_result');

    var i = 0;
    $('#search_result').find('h3[class="title"]').each(function(){
        var u=$(this).find('a').attr('href');
        var h = $(this);
        GM_xmlhttpRequest({
            method: "GET",
            url: u,
            'overrideMimeType':"text/html; charset="+charset,
            onload: function(res) {
                var page = res.responseText;
                var wordNum = getWordNum(page);
                var Point = getPoint(page);
                var pointPerWord = calcAvgPoint(wordNum, Point);
                var info = '<font style="color:red">[ 字数: '+wordNum+' | 积分: '+Point+' | 积分/字: '+pointPerWord+' ]</font>';
                h.append(info);
                i++;
                $('#bookID').html(i);
            }
        });

    });
}

function getWordNum(page){
    var m = page.match(/itemprop="wordCount">([0-9,]+)字<\/span>/);
    return m ? extractNum(m[1]) : 0;
}
function getPoint (page){
    var m = page.match(/作品积分：([0-9,]+)" \/>/);
    return m ? extractNum(m[1]) : 0;
}

function calcAvgPoint ( wordNum , point ) {
    if(wordNum == 0 ) return "0";
    var newPoint = (point/wordNum+0.5) + "";
    return newPoint.replace(/\.[0-9]+/,"");
}

function extractNum ( n ) {
    var m=n.match(/([0-9,]+)[^0-9]*$/);
    return m.length>0 ? parseInt(m[1].replace(/,/g,"")) : 0;
}

mainSearchSummary();
