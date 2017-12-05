'use strict';
var Alexa = require("alexa-sdk");
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

const APP_ID = 'amzn1.ask.skill.2d3e3def-9c7b-4675-bd68-625b2d9dea7f';

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'fightTable';
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var fightList = [['Cub Swanson', 'Brian Ortega', 90, 90, 5],['Jason Knight', 'Gabriel Benitez', 33, 220, 3]];
var resultList= [[null, null], [null, null]];

var event = 'UFC Fight Night, Swanson vs. Ortega';

//var pickNumber = 0;

var handlers = {
    'LaunchRequest': function() {
            this.emit('LaunchIntent');
    },
    
    'LaunchIntent': function () {
        if(this.attributes['picksLeft'] > 0){
            //this.attributes['picksLeft'] = fightList.length - pickNumber;
            this.emit(':ask', 'You still need to make' + this.attributes['picksLeft'] + "picks. Are you ready?");
        }
        else if(this.attributes['picksLeft'] == 0){
            this.emit(':tell', "You've made all your picks for this week's event. Tune in after the event for your results and ranking.");
        }
        else{
            this.attributes['pickNumber'] = 0;            
            this.attributes['counter'] = 0;
            this.attributes['picksLeft'] = fightList.length - this.attributes['pickNumber'];
            this.attributes['ufcPicks'] = {pick:[], result:[], points:[]};
            this.emit(':ask',"This week's event is " + event + ". You will need to choose who wins and by which method. Are you ready to make your picks?", "Please say yes or no.");
        }
    },
    'AMAZON.YesIntent' : function (){
        this.attributes['fighterOne']  = fightList[this.attributes['counter']][0];
        this.attributes['fighterTwo'] = fightList[this.attributes['counter']][1];
        var points1 = fightList[this.attributes['counter']][2];
        var points2 = fightList[this.attributes['counter']][3];
            //var rounds = fightList[counter][4];
        this.emit(':ask', "Say one if you want " + this.attributes['fighterOne'] + " for " + points1 + " points, or say two if you want " + this.attributes['fighterTwo'] + " for " + points2 + " points.", " Please say one or two.");
        // else{
        //     //his.attributes['counter'] += 1;
        //     this.attributes['fighterOne']  = fightList[this.attributes['counter']][0];
        //     this.attributes['fighterTwo'] = fightList[this.attributes['counter']][1];
        //     this.attributes['pointsOne'] = fightList[this.attributes['counter']][2];
        //     this.attributes['pointsTwo'] = fightList[this.attributes['counter']][3];
        //     this.emit(':ask', "Say one if you want " + this.attributes['fighterOne'] + " for " + this.attributes['pointsOne'] + " points or say two if you want " + this.attributes['fighterTwo'] + " for " + this.attributes['pointsTwo'] + " points.", " Please say one or two.");
        // }
    },
    'AMAZON.NoIntent' : function(){
        this.emit(':tell', "See you next time");
    },
    'PickIntent' : function (){
        if(this.event.request.intent.slots.fighter.value == 1){
            this.attributes['pickNumber'] += 1;
            this.attributes['picksLeft'] -= 1;
            //pickNumber += 1;
            this.attributes['ufcPicks'].pick.push(this.attributes['fighterOne']);
            this.attributes['ufcPicks'].points.push(fightList[this.attributes['counter']][2]);
            var points = fightList[this.attributes['counter']][2];
            //this.attributes['pickNumber'+this.attributes['pickNumber']] = this.attributes['fighterOne'];
            this.emit(':ask', 'You selected ' + this.attributes['fighterOne'] + ' for ' + points + " points. Does this fighter win by Knockout, submission, or decision?", "Please say knockout, submission, or decision");
        }
        else if(this.event.request.intent.slots.fighter.value == 2){
            this.attributes['pickNumber'] += 1;
            this.attributes['picksLeft'] -= 1;
            //pickNumber += 1;
            this.attributes['ufcPicks'].pick.push(this.attributes['fighterTwo']);
            this.attributes['ufcPicks'].points.push(fightList[this.attributes['counter']][3]);
            var points = fightList[this.attributes['counter']][3];
            //this.attributes['pickNumber' + this.attributes['pickNumber']] = this.attributes['fighterTwo'];
            this.emit(':ask', 'You selected ' + this.attributes['fighterTwo'] + ' for ' + points + " points. Does this fighter win by Knockout, submission, or decision?", "Please say knockout, submission, or decision");
        }else
            this.emit(':ask', "I didn't get that. Can you please say One if you think " + this.attributes['fighterOne'] + " will win, or two, if you think " + this.attributes['fighterTwo'] + " will win.", "Please say one or two.");
    },
    'MethodIntent' : function(){
        if(this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'knockout' || this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'submission' || this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'decision'){
            this.attributes['ufcPicks'].result.push(this.event.request.intent.slots.result.value);
            //this.attributes['pickMethod' + this.attributes['pickNumber']] = this.event.request.intent.slots.result.value;
            //this.emit(':tell', 'You selected ' + this.attributes['pickNumber' + this.attributes['pickNumber']] + " by " +  this.attributes['pickMethod' + this.attributes['pickNumber']] + '. Your finished with your UFC picks. Check in after the event to see your score and how you stacked up against the competition.');
            this.emit(':tell', 'You selected ' + this.attributes['ufcPicks'].pick[(this.attributes['pickNumber'] - 1)] + " by " + this.attributes['ufcPicks'].result[(this.attributes['pickNumber'] - 1)] + '. Your finished with your UFC picks. Check in after the event to see your score and how you stacked up against the competition.');
        }
        else if(this.event.request.intent.slots.result.value == 'knockout' || this.event.request.intent.slots.result.value == 'submission' || this.event.request.intent.slots.result.value == 'decision'){
            //this.attributes['pickMethod' + pickNumber] = 'knockout';
            this.attributes['ufcPicks'].result.push(this.event.request.intent.slots.result.value);
            //this.attributes['pickMethod' + this.attributes['pickNumber']] = this.event.request.intent.slots.result.value;
            this.attributes['counter'] += 1;
            //this.emit(':ask', 'You selected ' + this.attributes['pickNumber' + this.attributes['pickNumber']] + " by " +  this.attributes['pickMethod' + this.attributes['pickNumber']] + ". Are you ready for your next pick?", "Say yes to continue, or no to exit.");
            this.emit(':ask', 'You selected ' + this.attributes['ufcPicks'].pick[(this.attributes['pickNumber'] - 1)] + " by " + this.attributes['ufcPicks'].result[(this.attributes['pickNumber'] - 1)] + '. Are you ready for your next pick?',  'Say yes to continue, or no to exit.');
        }
        // else if(this.event.request.intent.slots.result.value == 'submission'){
        //     this.attributes['pickMethod' + pickNumber] = 'submission';
        // }
        // else if(this.event.request.intent.slots.result.value == 'decision'){
        //     this.attributes['pickMethod' + pickNumber] = 'decision';
        // }
        // else if(this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'knockout' || this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'submission' || this.attributes['picksLeft'] == 0 && this.event.request.intent.slots.result.value == 'decision'){
        //     this.emit(':tell', 'You selected ' + this.attributes['pickNumber' + this.attributes['pickNumber']] + " by " +  this.attributes['pickMethod' + this.attributes['pickNumber']] + '. Your finished with your UFC picks. Check in after the event to see your score and how you stacked up against the competition.');
        // }
        else{
            this.emit(':ask', "I didn't get that. Can you say knockout, submission, or decision as the method you think your pick will win?", "Say knockout, submission or decision.");
        }
        // this.attributes['counter'] += 1;
        // this.emit(':ask', 'You selected ' + this.attributes['pickNumber' + pickNumber] + " by " +  this.attributes['pickMethod' + pickNumber] + ". Are you ready for your next pick?", "Say yes to continue, or no to exit.");
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};
