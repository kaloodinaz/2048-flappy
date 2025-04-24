(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
  
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
  
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }());
  function KeyboardInputManager() {
    this.events = {};
  
    this.listen();
  }
  
  KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  };
  
  KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  };
  
  KeyboardInputManager.prototype.listen = function () {
    var self = this;
  
    function dojump(event) {
      var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                      event.shiftKey;
  
      if (!modifiers) {
        if (event.which >= 8 && event.which < 48) event.preventDefault();
        self.emit("jump");
      }
    }
  
    function dojump2(event) {
      event.preventDefault();
      self.emit("jump");
    }
  
    document.addEventListener("keydown", dojump);
    var gameContainer = document.querySelector(".game-container");
    gameContainer.addEventListener("click", dojump2);
    gameContainer.addEventListener("touchstart", dojump2);
  };
  
  KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
  };
  
  KeyboardInputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit("keepPlaying");
  };
  function HTMLActuator() {
    this.gridContainer    = document.querySelector(".grid-container");
    // this.tileContainer    = document.querySelector(".tile-container");
    this.scoreContainer   = document.querySelector(".score-container");
    this.bestContainer    = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");
    this.birdobj          = document.querySelector(".tile-bird");
    this.birdinn          = document.querySelector(".tile-bird .tile-inner");
    this.blockobja        = document.querySelector(".tile-block-a");
    this.blockobjb        = document.querySelector(".tile-block-b");
    this.blockobjc        = document.querySelector(".tile-block-c");
    this.blockobjd        = document.querySelector(".tile-block-d");
    this.blockinna        = document.querySelector(".tile-block-a .tile-inner");
    this.blockinnb        = document.querySelector(".tile-block-b .tile-inner");
    this.blockinnc        = document.querySelector(".tile-block-c .tile-inner");
    this.blockinnd        = document.querySelector(".tile-block-d .tile-inner");
  }
  
  HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;
  
    var classes = ["tile", "tile-bird"];
  
    var s = Math.floor(metadata.score);
  
         if (s > 2048) classes.push("tile-super")
    else if (s > 1024) classes.push("tile-2048")
    else if (s >  512) classes.push("tile-1024")
    else if (s >  256) classes.push("tile-512")
    else if (s >  128) classes.push("tile-256")
    else if (s >   64) classes.push("tile-128")
    else if (s >   32) classes.push("tile-64")
    else if (s >   16) classes.push("tile-32")
    else if (s >    8) classes.push("tile-16")
    else if (s >    4) classes.push("tile-8")
    else if (s >    2) classes.push("tile-4")
    else               classes.push("tile-2");
  
    this.applyClasses(this.birdobj, classes);
  
    var zonesize = this.gridContainer.clientHeight;
    var morepos = 0.75 * (metadata.score - s);
  
    this.birdobj.style.top = metadata.birdpos * zonesize + "px";
  
    this.blockobja.style.top = [0.5 , 0   , 0   ][metadata.ab] * zonesize + "px";
    this.blockobjb.style.top = [0.75, 0.75, 0.25][metadata.ab] * zonesize + "px";
    this.blockobjc.style.top = [0.5 , 0   , 0   ][metadata.cd] * zonesize + "px";
    this.blockobjd.style.top = [0.75, 0.75, 0.25][metadata.cd] * zonesize + "px";
  
    this.blockobja.style.left = (0.5  - morepos) * zonesize + "px";
    this.blockobjb.style.left = (0.5  - morepos) * zonesize + "px";
    this.blockobjc.style.left = (1.25 - morepos) * zonesize + "px";
    this.blockobjd.style.left = (1.25 - morepos) * zonesize + "px";
  
    this.birdinn.textContent = s;
  
    window.requestAnimationFrame(function () {
      self.updateScore(s);
      self.updateBestScore(Math.floor(metadata.bestScore));
    });
  };
  
  // Continues the game (both restart and keep playing)
  HTMLActuator.prototype.continue = function () {
    this.clearMessage();
  };
  
  HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };
  
  HTMLActuator.prototype.addTile = function (tile) {
    var self = this;
  
    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);
  
    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];
  
    if (tile.value > 2048) classes.push("tile-super");
  
    this.applyClasses(wrapper, classes);
  
    inner.classList.add("tile-inner");
    inner.textContent = tile.value;
  
    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);
  
      // Render the tiles that merged
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }
  
    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);
  
    // Put the tile on the board
    // this.tileContainer.appendChild(wrapper);
  };
  
  HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
  };
  
  HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
  };
  
  HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
  };
  
  HTMLActuator.prototype.updateScore = function (score) {
    //this.clearContainer(this.scoreContainer);
  
    var difference = score - this.score;
    this.score = score;
  
    if (difference > 0) {
      this.scoreContainer.textContent = this.score;
  
      var addition = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;
  
      this.scoreContainer.appendChild(addition);
    }
  };
  
  HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
  };
  
  HTMLActuator.prototype.message = function (won) {
    var type    = won ? "game-won" : "game-over";
    var message = won ? "You win!" : "Game over!";
  
    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  };
  
  HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
  };
  function Grid(size) {
    this.size = size;
  
    this.cells = [];
  
    this.build();
  }
  
  // Build a grid of the specified size
  Grid.prototype.build = function () {
    for (var x = 0; x < this.size; x++) {
      var row = this.cells[x] = [];
  
      for (var y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
  };
  
  // Find the first available random position
  Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();
  
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  };
  
  Grid.prototype.availableCells = function () {
    var cells = [];
  
    this.eachCell(function (x, y, tile) {
      if (!tile) {
        cells.push({ x: x, y: y });
      }
    });
  
    return cells;
  };
  
  // Call callback for every cell
  Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  };
  
  // Check if there are any cells available
  Grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
  };
  
  // Check if the specified cell is taken
  Grid.prototype.cellAvailable = function (cell) {
    return !this.cellOccupied(cell);
  };
  
  Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
  };
  
  Grid.prototype.cellContent = function (cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  };
  
  // Inserts a tile at its position
  Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
  };
  
  Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
  };
  
  Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size &&
           position.y >= 0 && position.y < this.size;
  };
  function Tile(position, value) {
    this.x                = position.x;
    this.y                = position.y;
    this.value            = value || 2;
  
    this.previousPosition = null;
    this.mergedFrom       = null; // Tracks tiles that merged together
  }
  
  Tile.prototype.savePosition = function () {
    this.previousPosition = { x: this.x, y: this.y };
  };
  
  Tile.prototype.updatePosition = function (position) {
    this.x = position.x;
    this.y = position.y;
  };
  window.fakeStorage = {
    _data: {},
  
    setItem: function (id, val) {
      return this._data[id] = String(val);
    },
  
    getItem: function (id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
  
    removeItem: function (id) {
      return delete this._data[id];
    },
  
    clear: function () {
      return this._data = {};
    }
  };
  
  function LocalScoreManager() {
    this.key     = "bestScoreF";
  
    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
  }
  
  LocalScoreManager.prototype.localStorageSupported = function () {
    var testKey = "test";
    var storage = window.localStorage;
  
    try {
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  LocalScoreManager.prototype.get = function () {
    return this.storage.getItem(this.key) || 0;
  };
  
  LocalScoreManager.prototype.set = function (score) {
    this.storage.setItem(this.key, score);
  };
  function GameManager(size, InputManager, Actuator, ScoreManager) {
    this.inputManager = new InputManager;
    this.scoreManager = new ScoreManager;
    this.actuator     = new Actuator;
  
    // hack
    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(this instanceof fNOP && oThis
                                     ? this
                                     : oThis || window,
                                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };
  
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
  
        return fBound;
      };
    }
  
    this.inputManager.on("jump", this.jump.bind(this));
  
    this.setup();
  
    this.timer();
  }
  
  // Restart the game
  GameManager.prototype.restart = function () {
    this.actuator.continue();
    this.setup();
  };
  
  // Keep playing after winning
  GameManager.prototype.keepPlaying = function () {
    this.keepPlaying = true;
    this.actuator.continue();
  };
  
  GameManager.prototype.isGameTerminated = function () {
    if (this.over || (this.won && !this.keepPlaying)) {
      return true;
    } else {
      return false;
    }
  };
  
  // Set up the game
  GameManager.prototype.setup = function () {
    this.score = 0;
    this.birdpos = 0.5;
    this.birdspd = 0;
    this.ab = 1;
    this.cd = 1;
  };
  
  // Set up the initial tiles to start the game with
  GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  };
  
  // Adds a tile in a random position
  GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var tile = new Tile(this.grid.randomAvailableCell(), value);
  
      this.grid.insertTile(tile);
    }
  };
  
  // Sends the updated grid to the actuator
  GameManager.prototype.actuate = function () {
    if (this.scoreManager.get() < this.score) {
      this.scoreManager.set(this.score);
    }
  
    this.actuator.actuate(this.grid, {
      score:      this.score,
      bestScore:  this.scoreManager.get(),
      birdpos:    this.birdpos,
      ab:         this.ab,
      cd:         this.cd
    });
  
  };
  
  // Save all tile positions and remove merger info
  GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (x, y, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  };
  
  // Move a tile and its representation
  GameManager.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  };
  
  // Move tiles on the grid in the specified direction
  GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2:down, 3: left
    var self = this;
  
    if (this.isGameTerminated()) return; // Don't do anything if the game's over
  
    var cell, tile;
  
    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;
  
    // Save the current tile positions and remove merger information
    this.prepareTiles();
  
    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);
  
        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next      = self.grid.cellContent(positions.next);
  
          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
  
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);
  
            // Converge the two tiles' positions
            tile.updatePosition(positions.next);
  
            // Update the score
            self.score += merged.value;
  
            // The mighty 2048 tile
            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }
  
          if (!self.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });
  
    if (moved) {
      this.addRandomTile();
  
      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }
  
      this.actuate();
    }
  };
  
  // Get the vector representing the chosen direction
  GameManager.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
      0: { x: 0,  y: -1 }, // up
      1: { x: 1,  y: 0 },  // right
      2: { x: 0,  y: 1 },  // down
      3: { x: -1, y: 0 }   // left
    };
  
    return map[direction];
  };
  
  // Build a list of positions to traverse in the right order
  GameManager.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };
  
    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
  
    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
  
    return traversals;
  };
  
  GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;
  
    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
             this.grid.cellAvailable(cell));
  
    return {
      farthest: previous,
      next: cell // Used to check if a merge is required
    };
  };
  
  GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  };
  
  // Check for available matches between tiles (more expensive check)
  GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;
  
    var tile;
  
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y });
  
        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell   = { x: x + vector.x, y: y + vector.y };
  
            var other  = self.grid.cellContent(cell);
  
            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }
  
    return false;
  };
  
  GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
  };
  
  GameManager.prototype.timer = function () {
    var self = this;
  
    // move
    this.birdpos += this.birdspd;
    this.birdspd += 0.00015 / (this.birdspd + 0.1);
  
    if (this.birdpos > 1 && this.birdspd > 0) this.birdspd = -this.birdspd;
    if (this.birdpos < -0.25 && this.birdspd < 0) this.birdspd = -this.birdspd;
  
    this.score += 1 / 64;
  
    // check
  
    var steppos = this.score - Math.floor(this.score);
  
    if (steppos > 5 / 12 && steppos < 11 / 12) {
      var range = {0: [-0.15, 0.3], 1: [0.2, 0.55], 2: [0.45, 0.9]};
      if (this.birdpos < range[this.ab][0] || this.birdpos > range[this.ab][1]) {
        this.score = steppos; // cut down the integer part
      }
    }
  
    if (steppos == 0) {
      this.ab = this.cd;
      this.cd = Math.floor(Math.random() * 3);
    }
  
    setTimeout(function () {self.timer();}, 384 / Math.sqrt(this.score + 256));
    this.actuate();
  }
  
  GameManager.prototype.jump = function () {
    if (this.birdspd < 0) {
      this.birdspd = -0.03;
    } else {
      this.birdspd = -0.025;
    }
  }
window.requestAnimationFrame(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  });