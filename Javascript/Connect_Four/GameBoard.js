//Alex Semenyuk - 9/22/2014
function GameBoard(elt) {
    var self = this;
    self.$elt = elt;
    self.player1 = "red";
    self.player2 = "black";
    self.DEPTH =  6;
    self.WIDTH = 7;
    var board = [];

    self.Init = function () {
        self.P1Name = "Player 1";
        self.P2Name = "Player 2";
        self.$p1Name = self.$elt.find('#p1-name');//Allow players to set their own names
        self.$p2Name = self.$elt.find('#p2-name');

        self.$board = self.$elt.find('.js-game-board');
        self.$pieces = self.$elt.find('.js-pieces');
        self.$pieces.click(self.HandleMove);
        self.$elt.find('.js-new-game').click(self.NewGame);
        self.NewGame();
        self.$elt.on('game-won', self.GameWon);//I assume this is what is meant by "bind scope to callbacks"
    };

    //These two do not need to be externally available from the plugin (psuedo-private) --->
    SetNotication = function (message) {
        self.$elt.find('#note').text(message);
    };

    self.GameWon = function (e, obj) {
        SetNotication('The Game has been won by: ' + obj);
        self.victory = true;
    };
    //<----

    //User has clicked on piece to drop, must be set in correct position if allowed
    self.HandleMove = function (e) {
        if (self.victory) {//No point to keep playing
            SetNotication('The Game is over, click "New Game" to play again.');
            return;
        }
        var $target = $(e.target);
        e.stopPropagation();
        if (!$target.hasClass('cell')) return;
        var x = $target[0].cellIndex;
        var canMove = self.TryDropPiece(x, self.currentPlayer);
        if (!canMove) {
            SetNotication('This is not a valid move');
            return;
        }
        SetNotication("");//Clear past notfications
        self.$board.find('table').find('tr').filter('.r' + self.lastMove.y).find('.c' + self.lastMove.x).addClass(self.currentPlayer);
        self.TryGetWinner();//See if this was a winning move
        self.currentPlayer = self.currentPlayer == self.player1 ? self.player2 : self.player1;
        self.$pieces.toggleClass('black');//This class has higher priority due to order
    };

    //Reset Everything
    self.NewGame = function () {
        self.victory = false;
        self.$pieces.addClass('red');
        self.CreateBoard();
        self.depths = [];
        for (var i = 0; i < self.WIDTH; i++) { self.depths[i] = self.DEPTH - 1; }
        self.RenderNewBoard();
        self.lastMove = { x: -1, y: -1 };//Not valid yet!
        self.currentPlayer = self.player1;
        self.$pieces.removeClass('black');
        SetNotication("");
    };

    //Init the board as a matrix, this is better than doing calculations in DOM
    self.CreateBoard = function () {
        board = [];
        for (var i = 0; i < self.DEPTH; i++)
        {
            board[i] = [];
            for (var j = 0; j < self.WIDTH; j++)
            {
                board[i][j] = "-";
            }
        }
        return board;
    };

    //Will only drop pieces if valid move : called from TryDropPiece
    DropPiece = function (xPos, player) {
        var insertDepth = self.depths[xPos];
        board[insertDepth][xPos] = player;
        self.lastMove = { x: xPos, y: insertDepth };
        self.depths[xPos]--;
    };

    //Checks if valid move and then drops
    self.TryDropPiece = function (xPos, player) {
        //invalid x axis position
        if (xPos < 0 || xPos >= self.WIDTH) return false; 
        // column is full
        if (board[0][xPos].length > 1) return false; 

        DropPiece(xPos, player);
        return true;
    }

    //Check Victory conditions
    self.TryGetWinner = function () {
        if(self.IsHorizontalWin() ||  self.IsVerticalWin() ||  self.IsDiagonalWin())
            self.$elt.trigger('game-won', self.GetLastPlayerName());
    };
    
    //Checks if the passed in victory line contains four in a row of the currently played piece
    IsVictory = function (line, piece) {
        return line.indexOf(Array(5).join(piece)) > -1
    };

   
    //Diagonals Left-to-Right && Right-to-Left
    self.IsDiagonalWin = function () {
        var piece = board[self.lastMove.y][self.lastMove.x];
        var line1 = piece;//We start a 1 piece
        var line2 = piece;

        var x = self.lastMove.x + 1;            
        var y = self.lastMove.y - 1; 
        while (x < self.WIDTH && y >= 0) {  
            line1 += board[y--][x++];          
        }

        var x = self.lastMove.x - 1; var y = self.lastMove.y + 1;
        while (x >= 0 && y < self.DEPTH) {
            line1 = board[y++][x--] + line1;
        }

        var x = self.lastMove.x - 1; var y = self.lastMove.y - 1;
        while (x >= 0 && y >= 0) {
            line2 += board[y--][x--];
        }

        var x = self.lastMove.x + 1; var y = self.lastMove.y + 1;
        while (x < self.WIDTH && y < self.DEPTH) {
            line2 = board[y++][x++] + line2;
        }

        //diagonal in 2 directions checked
        return IsVictory(line1, piece) || IsVictory(line2, piece);
    };

    //Looks for Win in the columns of last piece
    self.IsVerticalWin = function () {
        //Last played game-piece
        var piece = board[self.lastMove.y][self.lastMove.x];
        //using map to transpose in order to get a line & then its the same as horiz check
        var column = board.map(function (boardSlice, i) { return boardSlice[self.lastMove.x]; });
        var line = column.join('');
        return IsVictory(line, piece);
    };

    //Looks for win accross from current piece position
    self.IsHorizontalWin = function () {
        var piece = board[self.lastMove.y][self.lastMove.x];//Last played game-piece
        var line = board[self.lastMove.y].join('');//because its 2d array this is possible
        return IsVictory(line, piece);
    };

    //If the player has set their name will use that
    self.GetLastPlayerName = function () {
        if (board[self.lastMove.y][self.lastMove.x] == self.player1)
            return self.$p1Name.val() ? self.$p1Name.val() : self.P1Name;
        return self.$p2Name.val() ? self.$p2Name.val() : self.P2Name;
    };

    //DOM Board will shadow our virtual matrix
    self.RenderNewBoard = function () {
        var $table = $('<table class="ui-connect-4">');
        var $row = $('<tr>');
        for (var i = 0; i < self.WIDTH; i++)
            $row.append('<td class="cell c'+ i +'"></td>');
        for (var j = 0; j < self.DEPTH; j++) {
            $table.append($row.clone().addClass('r'+j));
            if (j == 0) self.$pieces.html($table.clone())
        }
        self.$board.html($table.clone());
    };
}

$.fn.GameBoard = function () {
    $(this).each(function (i, ele) {
        var $elt = $(ele);
        if ($elt.data('object')) return;
        $elt.data('object', new GameBoard($elt));
        $elt.data('object').Init();
    });
};