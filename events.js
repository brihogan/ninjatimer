var app = angular.module('timerApp', []);

app.controller('EventsController', ['$scope', 'Players', function($scope, Players) {
    $scope.players = Players;
    $scope.events = [
      {event_id:1, player_id:2, best:'00:17.4'},
      {event_id:2, player_id:4, best:'00:12.5'},
      {event_id:3, recording:true, rec_color:'red'},
      {event_id:4},
      {event_id:5},
      {event_id:7},
      {event_id:6}
    ];
    $scope.nextEvent = function() {
      $scope.events[2].player_id = 4;
      $scope.events[2].best = '00:28.1';
      $scope.events[2].recording = null;
      $scope.events[2].rec_color = null;
      $scope.events[3].recording = true;
      $scope.events[3].rec_color = 'red';
    };
}]);


app.controller('EventController', ['$scope','$timeout', function($scope, $timeout) {
    $scope.players = [
      {pos: 1, complete:100, player_id:2, time: 28100},
      {pos: 2, complete:100, player_id:1, time: 29200, diff:1000},
      {pos: 3, complete:100, player_id:6, time: 32300, diff:2000},
      {pos: 4, complete:50, player_id:4, time: 17500},
      {pos: 5, player_id:3, time:0, recording:true, rec_color:'red'},
      {pos: 6, player_id:5},
      {pos: 7, player_id:7},
      {pos: 8, player_id:8},
      {pos: 9, player_id:9}
    ];
    $scope.newEvent = function() {
      $scope.players = [
        {pos: 1, player_id:2, time: 0, recording:true, rec_color:'red'},
        {pos: 2, player_id:1},
        {pos: 3, player_id:6},
        {pos: 4, player_id:4},
        {pos: 5, player_id:3},
        {pos: 6, player_id:5},
        {pos: 7, player_id:7},
        {pos: 8, player_id:8},
        {pos: 9, player_id:9}
      ];
      playerIndex = 0;
    };
    var playerIndex = 4;
    $scope.recordRun = function() {
      var list = $scope.players;

      player = list[playerIndex];
      player.time = $scope.time ? parseInt($scope.time) : 28400;
      player.complete = $scope.complete ? parseInt($scope.complete) : 100;
      player.recording = false;
      player.rec_color = null;
      player.flash = true;
      var flashid = player.player_id;
      $timeout(function() {
        var player = _.find($scope.players, function(p) { return p.player_id === flashid });
        player.flash = false;
      }, 20000);

      var list = _(list).chain().sortBy(function(player) {
        return player.time;
      }).sortBy(function(player) {
        return -player.complete;
      }).value();


      var pos = 1;
      _.forEach(list, function(player) {
        // Give proper position based on complete, then time
        player.pos = pos++;
        // Get diff time from 1st place
        if (pos > 2 && player.complete === 100 && list[0].complete === 100) {
          player.diff = player.time - list[0].time;
        }
      });

      // Update recording player
      playerIndex++;
      if (playerIndex < list.length) {
        var player = list[playerIndex];
        player.recording = true;
        player.rec_color = 'red';
        player.time = 0;
      }
    };
}]);


app.controller('RankingController', ['$scope', function($scope) {
    $scope.ranking = [
      {rank:'1st', player_id:2, points: 100},
      {rank:'2nd', player_id:1, points: 95},
      {rank:'3rd', player_id:3, points: 78},
      {rank:'4th', player_id:6, points: 75},
      {rank:'5th', player_id:7, points: 72},
      {rank:'6th', player_id:4, points: 63},
      {rank:'7th', player_id:5, points: 61},
      {rank:'8th', player_id:9, points: 50},
      {rank:'9th', player_id:8, points: 3},
      {rank:'10th', player_id:10, points: 1}
    ];
}]);


app.service('Players', function() {
    this.list = [
      {id: 1, name:'Brian Hogan'},
      {id: 2, name:'Kevin Hogan'},
      {id: 3, name:'Bito Brady'},
      {id: 4, name:'Bob Brady'},
      {id: 5, name:'Mike Hogan'},
      {id: 6, name:'Jose Rodreguez'},
      {id: 7, name:'Theo Cruz'},
      {id: 8, name:'John Compton'},
      {id: 9, name:'Steve Fabrizio'},
      {id:10, name:'Herzog Warner'}
    ]
});

app.service('Events', function() {
    this.list = [
      {id: 1, title:'Red balls'},
      {id: 2, title:'Baseballs to pegs'},
      {id: 3, title:'Stairs to outer cliff'},
      {id: 4, title:'Rings to bar'},
      {id: 5, title:'Bars, Rocks, Stairs, Pegs, Rocks'},
      {id: 6, title:'Ascension to heaven'},
      {id: 7, title:'Dodge, ladder, bridge, rings, rope, yoga'},
      {id: 8, title:'Ropes, cargo, ropes'},
      {id: 9, title:'Cliffhangers'}
    ]
});


app.filter('player', ['Players', function(Players) {
    return function(input) {
      var player = _.find(Players.list, function(player) {
        return player.id == input
      });
      return player ? player.name : ''
    };
}]);

app.filter('event', ['Events', function(Events) {
    return function(input) {
      var evt = _.find(Events.list, function(evt) {
        return evt.id == input
      });
      return evt ? evt.title : ''
    };
}]);

app.filter('milli', function() {
    return function(milli) {
      if (isNaN(milli)) return ''

      var milliseconds = parseInt((milli%1000)/100)
          , seconds = parseInt((milli/1000)%60)
          , minutes = parseInt((milli/(1000*60))%60)
          , hours = parseInt((milli/(1000*60*60))%24);

      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return minutes + ":" + seconds + "." + milliseconds;


    };
});


app.filter('rank', function(Events) {
    return function(player) {
      var placement = '';
      if (player.complete === 100) {
        placement = ordinalSuffix(player.pos);
      }
      return player.complete < 100 ? 'DNF' : placement
    };
});


function ordinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
