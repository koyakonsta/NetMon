import Vue from 'nativescript-vue';
import {NmapAddress, NmapHost} from "~/netutils";

export const globalState : {
    scanlist: NmapHost[],
    portBehaviour: any,
    nmapStarted: boolean,
    tcpStarted: boolean,
  } = Vue.observable(
  {
    scanlist: [],
    portBehaviour: {},
    nmapStarted: false,
    tcpStarted: false,
  }
);
