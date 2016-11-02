//global variables
var players = [
	{
		name : "",
		wins : 0,
		losses : 0,
		currentMove : false
	},
	{
		name : "",
		wins : 0,
		losses : 0,
		currentMove : false
	}
];
var chatHistory = [];
// settings


function initGame(){
	$("button.play").click(function(){
		makeMove($(this).data("move"), $(this).parent().data("player")-1);
	});
	$("#result").on("click", "#newGameButton", 	newGame);
	$("button.setName").click(function(){
		var input = $(this).prev("input").val();
		var plyNum = $(this).parents("section").find("div.buttons").data("player");
		players[plyNum-1].name = input;
		displayPlayers();
	});
	//empty input when you click on it
	$("input.playerName").on("focus", function(){
		$(this).val("");
	})
	gameFromStorage();
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
		//hide buttons until next move
		$("section#player"+(player+1)).find("div.buttons").hide();

		// use default value if no name entered
		if (players[player].name === "") {
			players[player].name = "Player " + (player+1);
		}
	} else {
		// prevent someone from making multiple moves in a game
	}
	displayPlayers();
}
function displayPlayers(){
	for (var i = 0; i < players.length; i++) {
		var el = $("#player" + (i+1));
		if (players[i].name){
			el.find(".name").text(players[i].name);
		}
		el.find(".score").text("Wins: " + players[i].wins + ", Losses: " + players[i].losses);
		if (players[i].currentMove){
			el.find(".move").text("Played: " + players[i].currentMove);
		} else {
			el.find(".move").text("Played: ");
		}
	}
	// store the game each time it changes:
	gameToStorage();
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
		//show buttons
		$("section#player"+(i+1)).find("div.buttons").show();
	}
	$("#result #display").empty();
	displayPlayers();

}
function gameToStorage(){
	localStorage.setItem("game", JSON.stringify(players));
}

function gameFromStorage(){
	if (localStorage.getItem("game")){
		players = JSON.parse(localStorage.getItem("game"));
	}
}
$(document).ready(initGame);