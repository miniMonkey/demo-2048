var board = new Array();
var score = 0;
var hasConflicted = new Array();

var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;

$(document).ready(function() {
	prepareForMobile();
	newgame();
});

function prepareForMobile() {
	if (documentWidth > 500) {
		gridContainerWidth = 500;
		cellSiderLength = 100;
		cellSpace = 20;
	}

	$('#grid-container').css('width', gridContainerWidth - 2 * cellSpace);
	$('#grid-container').css('height', gridContainerWidth - 2 * cellSpace);
	$('#grid-container').css('padding', cellSpace);
	$('#grid-container').css('border-radius', 0.02 * gridContainerWidth);

	$('.grid-cell').css('width', cellSiderLength);
	$('.grid-cell').css('height', cellSiderLength);
	$('.grid-cell').css('border-radius', 0.02 * cellSiderLength);
}

function newgame() {
	// 初始化棋盘格
	init();
	// 在随机的两个格子生成数字
	generateOneNumber();
	generateOneNumber();
}

function init() {
	for(var i = 0; i < 4; i++)
		for(var j = 0; j < 4; j++) {
			var gridCell = $("#grid-cell-" + i + "-" + j);
			gridCell.css('top', getPosTop(i, j));
			gridCell.css('left', getPosLeft(i, j));
		}

	for(var i = 0; i < 4; i++) {
		board[i] = new Array();
		hasConflicted[i] = new Array();
		for(var j = 0; j < 4; j++) {
			board[i][j] = 0;
			hasConflicted[i][j] = false;
		}
	}

	updateBoardView();

	score = 0;
}

function updateBoardView() {
	$(".number-cell").remove();
	for(var i = 0; i < 4; i++)
		for(var j = 0; j < 4; j++) {
			$("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>');
			var theNumberCell = $('#number-cell-' + i + '-' + j);
			if (board[i][j] == 0) {
				theNumberCell.css('width', '0px');
				theNumberCell.css('height', '0px');
				theNumberCell.css('top', getPosTop(i, j) + cellSiderLength / 2);
				theNumberCell.css('left', getPosLeft(i, j) + cellSiderLength / 2);
				theNumberCell.css('font-size', 0.6 * cellSiderLength + 'px');
			}
			else {
				theNumberCell.css('width', cellSiderLength);
				theNumberCell.css('height', cellSiderLength);
				theNumberCell.css('top', getPosTop(i, j));
				theNumberCell.css('left', getPosLeft(i, j));
				theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
				theNumberCell.css('color', getNumberColor(board[i][j]));
				theNumberCell.css('font-size', getNumberSize(board[i][j]));
				theNumberCell.text(board[i][j]);
			}

			hasConflicted[i][j] = false;
		}

	$('.number-cell').css('line-height', cellSiderLength + 'px');
}

function generateOneNumber() {
	if (nospace(board))
		return false;

	// 随机一个位置
	var space = new Array();

	for (var i = 0; i < 4; i++)
		for (var j = 0; j < 4; j++)
			if (board[i][j] === 0)
				space.push([i, j]);

	var pos = parseInt(Math.floor(Math.random() * space.length), 10);
	var randX = space[pos][0];
	var randY = space[pos][1];

	// 随机一个数字
	var randNum = Math.random() < 0.5 ? 2 : 4;

	// 在随机位置显示随机数字
	board[randX][randY] = randNum;
	showNumberWithAnimation(randX, randY, randNum);

	return true;
}

$(document).keydown(function(event) {
	switch(event.keyCode) {
		case 37: // left
			event.preventDefault();
			if (moveLeft()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 38: // up
			event.preventDefault();
			if (moveUp()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 39: // right
			event.preventDefault();
			if (moveRight()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 40: // down
			event.preventDefault();
			if (moveDown()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		default: // default
			break;
	}
});

document.addEventListener('touchstart', function(event) {
	startX = event.touches[0].pageX;
	startY = event.touches[0].pageY;
});

document.addEventListener('touchmove', function(event) {
	event.preventDefault();
}, { passive: false });

document.addEventListener('touchend', function(event) {
	endX = event.changedTouches[0].pageX;
	endY = event.changedTouches[0].pageY;

	var deltaX = endX - startX;
	var deltaY = endY - startY;

	if (Math.abs(deltaX) < cellSiderLength && Math.abs(deltaY) < cellSiderLength)
		return;

	if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		if (deltaX > 0) {
			// move right
			if (moveRight()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
		else {
			// move left
			if (moveLeft()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
	}
	else {
		if (deltaY > 0) {
			// move down
			if (moveDown()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
		else {
			// move up
			if (moveUp()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
	}
});

function isgameover() {
	if (nospace(board) && nomove(board)) {
		gameover();
	}
}

function gameover() {
	alert('gameover!');
}

function moveLeft() {
	if (!canMoveLeft(board))
		return false;

	for (var i = 0; i < 4; i++)
		for (var j = 1; j < 4; j++)
			if (board[i][j] != 0) {
				for (var k = 0; k < j; k++) {
					if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {
						// move
						showMoveAnimation(i, j, i, k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
						// move
						showMoveAnimation(i, j, i, k);
						// add
						board[i][k] += board[i][j];
						board[i][j] = 0;
						// add score
						score += board[i][k];
						updateScore(score);
						hasConflicted[i][k] = true;
						continue;
					}
				}
			}

	setTimeout("updateBoardView()", 200);
	return true;
}

function moveUp() {
	if (!canMoveUp(board))
		return false;

	for (var i = 1; i < 4; i++)
		for (var j = 0; j < 4; j++)
			if (board[i][j] != 0) {
				for (var k = 0; k < i; k++) {
					if (board[k][j] == 0 && noBlockVertical(j, k, i, board)) {
						// move
						showMoveAnimation(i, j, k, j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[k][j] == board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {
						// move
						showMoveAnimation(i, j, k, j);
						// add
						board[k][j] += board[i][j];
						board[i][j] = 0;
						// add score
						score += board[k][j];
						updateScore(score);
						hasConflicted[k][j] = true;
						continue;
					}
				}
			}

	setTimeout("updateBoardView()", 200);
	return true;
}

function moveRight() {
	if (!canMoveRight(board))
		return false;

	for (var i = 0; i < 4; i++)
		for (var j = 2; j >= 0; j--)
			if (board[i][j] != 0) {
				for (var k = 3; k > j; k--) {
					if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {
						// move
						showMoveAnimation(i, j, i, k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
						// move
						showMoveAnimation(i, j, i, k);
						// add
						board[i][k] += board[i][j];
						board[i][j] = 0;
						// add score
						score += board[i][k];
						updateScore(score);
						hasConflicted[i][k] = true;
						continue;
					}
				}
			}

	setTimeout("updateBoardView()", 200);
	return true;
}

function moveDown() {
	if (!canMoveDown(board))
		return false;

	for (var i = 2; i >= 0; i--)
		for (var j = 0; j < 4; j++)
			if (board[i][j] != 0) {
				for (var k = 3; k > i; k--) {
					if (board[k][j] == 0 && noBlockVertical(j, i, k, board)) {
						// move
						showMoveAnimation(i, j, k, j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[k][j] == board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {
						// move
						showMoveAnimation(i, j, k, j);
						// add
						board[k][j] += board[i][j];
						board[i][j] = 0;
						// add score
						score += board[k][j];
						updateScore(score);
						hasConflicted[k][j] = true;
						continue;
					}
				}
			}

	setTimeout("updateBoardView()", 200);
	return true;
}








































































