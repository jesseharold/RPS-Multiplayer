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
var game = {
	playersConnected : 0,
	watchersConnected : 0,
	chatHistory : []
};
var database;
// settings

function initGame(){
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDpkXfloYmdVW9IyEoyfTrAE07OmBKNf8U",
		authDomain: "testing-3cc34.firebaseapp.com",
		databaseURL: "https://testing-3cc34.firebaseio.com",
		storageBucket: "testing-3cc34.appspot.com",
		messagingSenderId: "222650091540"
	};
  	firebase.initializeApp(config);

	// get a reference to the database
	database = firebase.database();
	
	// update local data when database changes
	database.ref("players").on("value", function(snapshot){
		players = snapshot.val();
		displayPlayers();
	}, function(error){
		console.error(error);
	});

	$("button.play").click(function(){
		makeMove($(this).data("move"), $(this).parent().data("player")-1);
	});
	$("#result").on("click", "#new-game-button", 	newGame);
	$("button.set-name").click(function(){
		var input = $(this).prev("input").val();
		var playerNumber = $(this)
			.parents("section")
			.find("div.buttons")
			.data("player");
		players[playerNumber-1].name = input;
		saveGameToStorage();
	});
	//empty input when you click on it
	$("input.player-name").on("focus", function(){
		$(this).val("");
	});
	newGame();
}
function makeMove(move, playerID){
	if (!players[playerID].currentMove && players[playerID].name){
		// prevent someone from making multiple moves in a game
		// you have to set your name before you can make a move
		players[playerID].currentMove = move;
		saveGameToStorage();
		//hide buttons until next move
		$("section#player"+(playerID+1)).find("div.buttons").hide();

		var otherPlayer = (playerID+1) % 2;
		if (players[otherPlayer].currentMove){
			// both players have made moves
			var winner = testMoves(players[playerID].currentMove, players[otherPlayer].currentMove);
			displayWinner(winner);
		}
	}
}
function displayPlayers(){
	for (var i = 0; i < players.length; i++) {
		var section = $("#player" + (i+1));
		if (players[i].name){
			section.find(".name").text(players[i].name);
		}
		var scoreText = "Wins: " + players[i].wins + ", Losses: " + players[i].losses;
		section.find(".score").text(scoreText);
		if (players[i].currentMove){
			var handImage = $("<img>");
			handImage
				.attr("src", "assets/images/" + players[i].currentMove + ".png")
				.addClass("hand-image");
			section.find(".move").html(handImage);
		} else {
			section.find(".move").html("");
		}
	}
	// store the game each time it changes:
	saveGameToStorage();
}
function testMoves(moveZero, moveOne){
	// more concise way to see who wins
	// moves in ascending value of power:
	var moves = ["paper", "scissors", "rock"];
	var move0 = moves.indexOf(moveZero);
	var move1 = moves.indexOf(moveOne);

	// test the difference between the moves' values:
	switch (move0 - move1){
		case 0:
			// the moves are the same
			return "tie";
		case 1:
			//if a move is one larger, it wins
			return 0;
		case -1:
			return 1;
		case 2:
			// 2 means rock v paper, paper wins
			return 1;
		case -2:
			// neg 2 means paper v rock, paper wins
			return 0;
	}
}
function displayWinner(winnerID){
	if (winnerID === "tie"){
		$("#result #display").text("Tie!");
	} else {
		$("#result #display").text(players[winnerID].name + " wins!");
		players[winnerID].wins++;
		var otherPlayer = (winnerID+1) % 2;
		players[otherPlayer].losses++;
	}
	saveGameToStorage();
	var newGameButton = $("<button>");
	newGameButton
		.text("Play Again")
		.attr("id", "new-game-button");
	$("#result #display").append(newGameButton);
}
function newGame(){
	for (var i = 0; i < players.length; i++) {
		players[i].currentMove = false;
		//show buttons
		$("section#player"+(i+1)).find("div.buttons").show();
	}
	$("#result #display").empty();
	saveGameToStorage();

}
function saveGameToStorage(){
	database.ref("players").set(players);
}


$(document).ready(initGame);