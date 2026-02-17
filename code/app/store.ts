import Vue from 'nativescript-vue';

export const globalState = Vue.observable(
  {
    scanlist: [],
    portBehaviour: {},
    nmapStarted: false,
    tcpStarted: false,
  }
);
