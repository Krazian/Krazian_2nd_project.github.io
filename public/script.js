$( document ).ready(function() {
console.log("TROLOLOLOL")

var link = $("<a>").attr("href","/threads");

setTimeout(function(){
	$(".enter").append(link);
	$("a").addClass("pure-button pure-button-active");
	$("a").text("Enter TROLOLOLOL");
}	,8000);
});