var w = 84; /* w = ширина li*/
var s = {
loader : { obj:$('<div class="circularG_i"><div class="G_1 circularG"></div><div class="G_2 circularG"></div><div class="G_3 circularG"></div><div class="G_4 circularG"></div><div class="G_5 circularG"></div><div class="G_6 circularG"></div><div class="G_7 circularG"></div><div class="G_8 circularG"></div></div>'),
		thumb:('<div class="circularG_t"><div class="G_1 circularG"></div><div class="G_2 circularG"></div><div class="G_3 circularG"></div><div class="G_4 circularG"></div><div class="G_5 circularG"></div><div class="G_6 circularG"></div><div class="G_7 circularG"></div><div class="G_8 circularG"></div></div>'),
	info: {height: 50, width:50}, loader:true
},
gallery :[],
lock: 1,

aNewThumb: function(indx){	
	
	s.tContainer.find('li:nth-child('+(indx+1)+')')
	.append($('<a href="javascript:s.jump('+indx+')"></a>').append(s.gallery[indx].thumb));
	
	s.tContainer.css({'width':(indx+1)*w+1});
	if (indx % 10 == 0) s.tContainer.css({'width': Math.floor(s.gallery[indx].thumb.parent().position().left+w)});
	return false;
},

changeImg: function(direction){

	var dir = (direction) || ( s.coming.index > s.current.index ? 1 : -1),
		shift=600,	
		current   = s.current.obj,
		coming   = s.coming.obj,
		currentEnd = current.position(), comingEnd= {'opacity':1},
		comingStart = s.getCentered(s.coming);		
		
		if (current == coming){return;}
		
		if (s.coming.index == 0) s.left.css({'display':'none'});
		if (s.current.index == 0) s.left.css({'display':'block'});
		
		if (s.coming.index == mainObj.imageCount) s.right.css({'display':'none'});
		if (s.current.index == mainObj.imageCount) s.right.css({'display':'block'});
		
		s.lock = 0; 
		setTimeout("s.lock = 1;", 300);

		(s.current.thumb).parent().removeClass('selected');
		(s.coming.thumb).parent().addClass('selected');
		
		currentEnd.opacity = 0;
		comingStart.opacity = 0;
		comingEnd.left = comingStart.left + 0;
	
	if (dir == 1){
			comingStart.left += shift;
			currentEnd.left -= shift;
		}
	else {
		comingStart.left -= shift;
		currentEnd.left += shift;
	}
	
	$.when(
		coming.css(comingStart).appendTo(s.iContainer).animate(comingEnd,600),
        current.animate( currentEnd, 600)			
    )
     .then(function(){
        current.remove();					
		if (s.coming.loader) {s.getMore();}	
		else s.keepVisible(s.current.index);
    });
	s.current = s.coming;	
	localStorage.id= s.current.index;
},
 
next: function(){
if (!s.lock) return;
	var i = s.current.index;	
if (i == (s.gallery.length-1)){ s.loader.index = i+1; s.coming=s.loader;}	
else s.coming = s.gallery[(i+1)];	
	s.changeImg(1);
},

prev: function(){
if (!s.lock) return;
	var i = s.current.index;
	if( i != 0){		
		s.coming = s.gallery[(i-1)]; s.changeImg(-1);
	}	
},

jump: function(i){
if (!s.lock) return;
	s.coming = s.gallery[i];
	s.centerThumb(i);
	s.changeImg();
},

centerThumb: function(k){
	var totLength = s.gallery.length;
	if (k > totLength-1) return;
	
	var windW= $(window).width(), position= s.tContainer.position().left,tmp,tmp2;

	tmp = Math.ceil(w*k-(windW- w)/2);
	tmp2 = Math.ceil((totLength-k-1)*w -(windW- w)/2);
	console.log('tmp= '+tmp);	
	
	if (tmp > 0 && tmp2 > 0)
		s.tContainer.animate({left: -tmp}, 1000);
	else {
		if (tmp < 0) {s.tContainer.animate({left: 0}, 1000); return;}
		if (tmp2 < 0) {s.tContainer.animate({left: windW - totLength*w }, 1000); return;}				
	}
return false;
},

keepVisible: function(i){
	var windW= $(window).width(), pos= s.tContainer.position().left, tPos = s.gallery[i].thumb.parent().position().left;
	if ( -pos >= tPos) {
		if (pos + 2*w < 0)s.tContainer.animate({left: pos + Math.floor(1.5*w)}, 300); 
		else s.tContainer.animate({left: 0}, 500);
		return;}		
	if ( pos+tPos+w > windW) s.tContainer.animate({left: -Math.floor(tPos+w - windW)}, 300);
},

getCentered : function(theObj){
	var windowH=$(window).height(), windowW=$(window).width();
	var imgH = theObj.info.height, imgW = theObj.info.width;
	var hDiff = imgH/windowH, wDiff=imgW/windowW,offsetX,offsetY;
	
	if (hDiff>1 || wDiff>1){
		if (wDiff > hDiff) { imgW = windowW; imgH=Math.ceil(imgH/wDiff); hDiff = imgH/windowH ;wDiff=1; }
		else {imgH=windowH; imgW=Math.ceil(imgW/hDiff); wDiff=imgW/windowW; hDiff=1;}	
	}	
	offsetY = Math.floor((1-hDiff)*windowH/2);
	offsetX = Math.floor((1-wDiff)*windowW/2);	
	
	return {'left': offsetX, 'top':offsetY, 'width': imgW, 'height':imgH};
},


getMore: function(n){
	var l = s.gallery.length, j, k;	
	j = n || ((mainObj.imageCount - l > 10) ? 10 : mainObj.imageCount - l);

	if (j == 0) return;

	k = l%100;
	if (k == 0)	{
		var url = mainObj.links.next + '&callback=?'
		$.getJSON(url)
			.done(function( data ) {
				mainObj = data;	
				addToGallery();				
			});
	}
	else { addToGallery();}
	
function addToGallery(){
	var src, L=l,link;
	j+=l;
	
	for (; l<j; l++, k++){
	
	$('<li>'+s.loader.thumb+'</li>').appendTo( s.tContainer );
	
	src = mainObj.entries[k].img;
	link = (src.orig || src.L || src.M);	
	$.when(	
		s.gallery[l] = {
			info : src.orig || src.L || src.M|| src.S,
			obj : $( "<img/>" ).attr('src', link.href ),
			index: l,
			thumb: $( "<img/>" ).attr('src', src.XXS.href)}
	).then(function(){
	
		s.aNewThumb(l);
		
		if ( (L=l && s.current == s.loader) || !s.current && localStorage.id == l || !s.current && !localStorage.id) {
			s.current = s.gallery[l];
			
			if (s.current.index == 0) s.left.css({'display':'none'});	
			if (s.current.index == mainObj.imageCount) s.right.css({'display':'none'});	
			
			var style = s.getCentered(s.current);
			(s.current.thumb).parent().addClass('selected');
			
			s.keepVisible(l);
			
			s.current.obj.css(style).hide().appendTo(s.iContainer).fadeIn(500);
			s.current.obj.load(s.loader.obj.remove());		
			}
		if (l == j-1 && !s.current && localStorage.id) {s.getMore();}
			
		});	}}
}

}

var mainObj, url = "http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?callback=?";
  
  $.getJSON( url, {
    format: "json"	
  })
  .done(function( data ) {
	mainObj = data;})
	.done(function(){
	s.getMore(20);})
	.done(function(){(s.tContainer).animate({'margin-top': 85}, 2500);});
	
/*** Global Events*****/
$(window).resize(function() { (s.current.obj).css(s.getCentered(s.current));});
$(document).keydown(function(e){
    if (e.keyCode == 38 || e.keyCode == 39)  s.next(); 
    if (e.keyCode == 37 || e.keyCode == 40)  s.prev(); 
});
 
$(function() {	
	s.iContainer= $('#stage');
	s.tContainer=$('#thumbs ul');
	s.left = $('#controls .left');
	s.right = $('#controls .right');
	
	$('#thumbs').mouseenter(function(event) { 
		s.tContainer.animate({'margin-top': 0}, 500);			
	}).mouseleave(function(event){ 
	(s.tContainer).animate({'margin-top': 85}, 500); 
	});
	
	$('body').mouseenter(function(event){ 
			$('#controls').fadeIn('fast');})
	.mouseleave(function(event){ 
		$('#controls').fadeOut(600); 
	});	
	
    $('#thumbs').bind('mousewheel', function(event, delta) {
		var tmp = s.tContainer.position().left + delta*w;
		if (  tmp - w/2 <=0 && (s.gallery.length *w + tmp + w/2> $(window).width()-10 ) ){
        if (tmp > 0 ) tmp=0;		
		if ( -tmp +$(window).width() > (s.gallery.length -1)*w ) s.getMore();
		s.tContainer.css('left', tmp);}		
        return false;
    });
	
	s.loader.obj.css(s.getCentered(s.loader)).appendTo(s.iContainer);
});


/****************** jQ Mousewheel ***************/

(function(d){function e(a){var b=a||window.event,c=[].slice.call(arguments,1),f=0,e=0,g=0,a=d.event.fix(b);a.type="mousewheel";b.wheelDelta&&(f=b.wheelDelta/120);b.detail&&(f=-b.detail/3);g=f;b.axis!==void 0&&b.axis===b.HORIZONTAL_AXIS&&(g=0,e=-1*f);b.wheelDeltaY!==void 0&&(g=b.wheelDeltaY/120);b.wheelDeltaX!==void 0&&(e=-1*b.wheelDeltaX/120);c.unshift(a,f,e,g);return(d.event.dispatch||d.event.handle).apply(this,c)}var c=["DOMMouseScroll","mousewheel"];if(d.event.fixHooks)for(var h=c.length;h;)d.event.fixHooks[c[--h]]=
d.event.mouseHooks;d.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],e,false);else this.onmousewheel=e},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],e,false);else this.onmousewheel=null}};d.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);