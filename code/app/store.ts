import Vue from 'nativescript-vue';

export const globalState = Vue.observable(
  {
    devices: [
      {"name": '8a:3b:85:ef:4b:1b', "safe": true},
      {"name": '97:d4:b3:b3:21:f6', "safe": false},
      {"name": 'af:50:59:70:f4:f1', "safe": true},
      {"name": '4c:ae:b2:16:24:a8', "safe": false},
      {"name": 'd8:f4:29:61:04:dc', "safe": true},]
  }
);
