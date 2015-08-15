$( document ).ready(function() {
console.log("TROLOLOLOL")

var link = $("<a>").attr("href","/threads");

setTimeout(function(){
	$("body").append(link);
	$("a").addClass("pure-button pure-button-active");
	$("a").text("Enter TROLOLOLOL");
}	,5000);
});