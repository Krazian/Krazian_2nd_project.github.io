$( document ).ready(function() {
console.log("TROLOLOLOL")

var enter = $("<button>").attr("id","enter");
var link = $("<a>").attr("href","/threads");

setTimeout(function(){
	$("body").append(enter);
	$("#enter").append(link);
	$("a").text("Enter TROLOLOLOL");
}	,5000);
});