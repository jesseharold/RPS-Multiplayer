//global variables
var players = [
	{
		name : "Playerz 1",
		wins : 0,
		losses : 0,
		currentMove : false
	},
	{
		name : "Playerx 2",
		wins : 0,
		losses : 0,
		currentMove : false
	}
];
// settings


function initGame(){
	$("button.play").click(function(){
		makeMove($(this).data("move"), $(this).parent().data("player")-1);
	});
	$("#result").on("click", "#newGameButton", 	newGame);
	newGame();
}
function makeMove(move, player){
	if (!players[player].currentMove){
		players[player].currentMove = move;

		var otherPlayer = (player+1) % 2;
		if (players[otherPlayer].currentMove){
			var winner = testMoves();
			displayWinner(winner);
		}
	} else {
		//console.log("You already chose your move.");
	}
	displayPlayers();
}
function displayPlayers(){
	for (var i = 0; i < players.length; i++) {
		var el = $("#player" + (i+1));
		//console.log(el);
		el.find(".name").text(players[i].name);
		el.find(".score").text("Wins: " + players[i].wins + ", Losses: " + players[i].losses);
		if (players[i].currentMove){
			el.find(".move").text("Played: " + players[i].currentMove);
		} else {
			el.find(".move").text("Played: ");
		}
	}
}
function testMoves(){
	if (players[0].currentMove === "rock"){
		if (players[1].currentMove === "rock"){
			return "tie";
		} else if (players[1].currentMove === "paper"){
			return 1;
		} else if (players[1].currentMove === "scissors"){
			return 0;
		}
	} else if (players[0].currentMove === "paper"){
		if (players[1].currentMove === "rock"){
			return 0;
		} else if (players[1].currentMove === "paper"){
			return "tie";
		} else if (players[1].currentMove === "scissors"){
			return 1;
		}
	} else if (players[0].currentMove === "scissors"){
		if (players[1].currentMove === "rock"){
			return 1;
		} else if (players[1].currentMove === "paper"){
			return 0;
		} else if (players[1].currentMove === "scissors"){
			return "tie";
		}
	}
}
function displayWinner(plyr){
	if (plyr === "tie"){
		$("#result #display").text("Tie!");
	} else {
		$("#result #display").text(players[plyr].name + " wins!");
		players[plyr].wins++;
		var otherPlayer = (plyr+1) % 2;
		players[otherPlayer].losses++;
	}
	displayPlayers();
	var newGameButton = $("<button>").text("Play Again").attr("id", "newGameButton");
	$("#result #display").append(newGameButton);
}
function newGame(){
	for (var i = 0; i < players.length; i++) {
		players[i].currentMove = false;
	}
	$("#result #display").empty();
	displayPlayers();

}
$(document).ready(initGame);