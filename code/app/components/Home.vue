<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Config" android.position="actionBar" @tap="goToConfig"/>
    </ActionBar>

    <StackLayout>
      <template v-if="!tcpStarted">
        <Label  text="The tcpdump worker didn't run. Press the 'Scan Packets' button to manually launch it and scan packets." />
        <Button text="Scan Packets" @tap="scanPackets" />
      </template>
      <template v-if="!nmapStarted">
        <Label text="The nmap worker didn't run. Press the 'Scan Network' button to manually scan the list of devices on the network." />
      </template>

      <Button text="Scan Network" @tap="scanDevices" />
      <RadPieChart allowAnimation="true" height="200"> <!-- pie chart showing threat stats -->
        <DonutSeries v-tkPieSeries
                     selectionMode="DataPoint"
                     seriesName="pal"
                     paletteMode="DataPoint"
                     expandRadius="0.4"
                     outerRadiusFactor="0.7"
                     innerRadiusFactor="0.4"
                     valueProperty="count"
                     legendLabel="type"
                     :items="threatStats"/>

        <Palette tkPiePalette seriesName="pal">
          <PaletteEntry tkPiePaletteEntry fillColor="blue" strokeColor="blue"/>
          <PaletteEntry tkPiePaletteEntry fillColor="red" strokeColor="red"/>
          <PaletteEntry tkPiePaletteEntry fillColor="yellow" strokeColor="yellow"/>
        </Palette>
        <RadLegendView v-tkPieLegend position="Right" title="" offsetOrigin="TopRight" width="110"/>
      </RadPieChart>

      <ActivityIndicator v-if="!(scanlist.length)" :busy="true" />

      <ListView :items="scanlist" class="list">
        <v-template v-slot="{ item }">
          <GridLayout columns="*,*" rows="auto,auto,auto">
            <Label row="0" col="0" textWrap="true" :text="'Status: '+item.status.state" :class="getClass(item)"/>
            <Label row="0" col="1" textWrap="true" :text="'Address: '+addrs2list(item.address)" :class="getClass(item)"/>
            <Label row="1" col="0" textWrap="true" :text="'Hostname: '+hosts2list(item.hostnames)" :class="getClass(item)"/>
            <Label row="1" col="1" textWrap="true" :text="'Vendor: '+item.vendor" :class="getClass(item)"/>
            <Label row="2" col="0" textWrap="true" :text="'Risk score: '+item.riskScore" :class="getClass(item)"/>
            <Button row="2" col="1" :text="getButtonText(item)" @tap="toggleSafe(item)" :class="getButtonClass(item)"/>
          </GridLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import Config from "@/components/Config.vue";
  import {globalState} from "~/store";
  import * as netutils from "~/netutils";
  import {NmapAddress, NmapHost} from "~/netutils";
  import {analysePacket} from "~/packets";
  const nmpw = new Worker('~/nmapworker.ts');
  const tcpw = new Worker('~/tcpworker.ts');
  tcpw.onerror = (err) => {
    console.log("Tcp Worker crashed:", err.message);
    console.log("Filename:", err.filename);
    console.log("Line:", err.lineno);
    tcpw.postMessage({})
  };
  tcpw.onmessage = (msg) => {
    if (msg.data === "ready") {
      globalState.tcpStarted = true;
      return;
    }
    // console.log("Data from worker:", JSON.stringify(msg.data));
    analysePacket(msg.data.header, msg.data.data.data)
  };
  nmpw.onerror = (err) => {
    console.log("Nmap Worker crashed:", err.message);
    console.log("Filename:", err.filename);
    console.log("Line:", err.lineno);
    nmpw.postMessage({})
  }
  nmpw.onmessage = (msg) => {
    if (msg.data === "ready") {
      globalState.nmapStarted = true;
      return;
    }
    globalState.scanlist=msg.data;
  }
  let started = false;

  export default Vue.extend({
    computed: {
      scanlist() {
        return globalState.scanlist;
      },
      nmapStarted() {
        return globalState.nmapStarted;
      },
      tcpStarted() {
        return globalState.tcpStarted;
      },
      threatStats(){
        const unsafe = globalState.scanlist.filter(_ => !(_.isSafe)).length;
        const safe = globalState.scanlist.filter(_ => _.isSafe).length;
        const potential = globalState.scanlist.filter(_ => (_.riskScore>0 && _.isSafe) ).length;
        return [
            {'type':"Unsafe", 'count':(unsafe), 'color': 'red'},
            {'type':"Safe", 'count':(safe), 'color': 'green'},
            {'type':"Potential Threat", 'count':(potential), 'color': 'green'}
        ]
      }
    },
    data() {
      return {
        netutils: netutils,
      }
    },
    methods: {
      goToConfig(){
        this.$navigateTo(Config)
      },

      getClass(device: NmapHost) {
        return device.isSafe ? "safe" : "unsafe";
      },
      getButtonClass(device: NmapHost) {
        return device.isSafe ? "unsafe-button" : "safe-button";
      },
      getButtonText(device: NmapHost) {
        return device.isSafe ? "Mark Unsafe" : "Mark Safe";
      },
      toggleSafe(device: NmapHost) {
        device.isSafe = !device.isSafe;
      },

      scanDevices(){
        globalState.scanlist=[];
        nmpw.postMessage({});
      },
      scanPackets() {
        tcpw.postMessage({})
      },

      hosts2list(h : { name: string; type: string }[]) {
        return [].concat(h).map(i => (i?.name ?? 'None')).join(", ");
      },
      addrs2list(h : NmapAddress[]) {
        return [].concat(h).map(i => (i.addrtype+':'+i.addr)).join(", ");
      },
},

    mounted() {
      if (!started) {
        console.log("Starting workers...")
        nmpw.postMessage({});
        tcpw.postMessage({});
        started = true;
      }
    },

    beforeDestroy() {
      console.log("Killing the workers before terminating");
      if (nmpw) {
        nmpw.terminate();
      }
      if (tcpw) {
        tcpw.terminate();
      }
    }
  });
</script>

<style>
.safe {
  color: green;
}
.safe-button {
  background-color: #80ff80;
}
.unsafe {
  color: red;
}
.unsafe-button {
  background-color: #ff8080;
}
</style>
