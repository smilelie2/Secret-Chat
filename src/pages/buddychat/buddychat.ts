import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Content } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import firebase from 'firebase';
/**
 * Generated class for the BuddychatPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-buddychat',
  templateUrl: 'buddychat.html',
})
export class BuddychatPage {
  @ViewChild('content') content: Content;
  buddy: any;
  newmessage;
  allmessages = [];
  photoURL;
  timer = 10;
  constructor(public navCtrl: NavController, public navParams: NavParams, public chatservice: ChatProvider,
              public events: Events, public zone: NgZone) {
    
    this.buddy = this.chatservice.buddy;
    this.photoURL = firebase.auth().currentUser.photoURL;
    this.scrollto();
    this.events.subscribe('newmessage', () => {
      this.allmessages = [];
      this.zone.run(() => {
        this.allmessages = this.chatservice.buddymessages;
        
        console.log(this.allmessages)
        this.decryptViginere(this.allmessages);
        for (var key in this.allmessages) {
          var d = new Date(this.allmessages[key].timestamp);
          var hours = d.getHours();
          var minutes = "0" + d.getMinutes();
          var month = d.getMonth();
          var da = d.getDate();
          
          var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
            
          var formattedTime = monthNames[month] + "-" + da + "-" + hours + ":" + minutes.substr(-2);
          this.allmessages[key].timestamp = formattedTime;
          
        
          this.allmessages[key].messageexpiredReal = this.allmessages[key].messageexpired;

          setInterval(function () {
            var currentTime = new Date();
            console.log(Math.floor(((this.allmessages[key].messageexpiredReal - currentTime.getTime() )/ 1000)));

            this.allmessages[key].countdown = Math.floor(((this.allmessages[key].messageexpiredReal - currentTime.getTime() )/ 1000));
          }.bind(this), 1000)
          
          var d2 = new Date(this.allmessages[key].messageexpired);
          var hours2 = d2.getHours();
          var minutes2 = "0" + d2.getMinutes();
          var month2 = d2.getMonth();
          var da2 = d2.getDate();
          var formattedTime2 = monthNames[month2] + "-" + da2 + "-" + hours2 + ":" + minutes2.substr(-2);
          this.allmessages[key].messageexpired = formattedTime2;

          var currentTime2 = new Date();
          if (this.allmessages[key].messageexpiredReal - currentTime2.getTime() < 0) {
            this.allmessages[key].isexpired = true;
          }
          else {
            this.allmessages[key].isexpired = false;
          }
        }
      })
      
    })
  }
  startTimer(messageexpired) {
    setInterval(function () {
      var currentTime = new Date();
      console.log(messageexpired - currentTime.getTime());
      return messageexpired - currentTime.getTime();
       
    }.bind(this), 1000)
  }
  addmessage() {
    let encrypted = this.encryptViginere(this.newmessage);
    // สร้างฟังก์ชั่น เข้ารหัสที่นี้นะ
    this.chatservice.addnewmessage(encrypted).then(() => {
      this.content.scrollToBottom();
      this.newmessage = '';
    })
  }
  encryptViginere(newmessage) {
    console.log(newmessage);
    let key = firebase.auth().currentUser.uid // key เป็นของผู้ส่ง
    var keyAt = 0;
    let messageEncrypt = '';
    for(var _i = 0; _i < newmessage.length; _i++, keyAt++) {
      if (newmessage.charCodeAt(_i) <= 126) {// อังกฤษ
        if (keyAt >= key.length)  {
          keyAt = 0;
        }
        
        messageEncrypt += String.fromCharCode((((newmessage.charCodeAt(_i) - 32) + (key.charCodeAt(keyAt) -32)) % 95) + 32);
      }
      else if(newmessage.charCodeAt(_i) >= 3585 && newmessage.charCodeAt(_i) <= 3673) {// ภาษาไทย
        if (keyAt > key.length)  {
          keyAt = 0;
        }
        messageEncrypt += String.fromCharCode((((newmessage.charCodeAt(_i) - 3585) + (key.charCodeAt(keyAt) - 32)) % 89) + 3585);
      }
    }
    return messageEncrypt;
  }
  decryptViginere(receivemessage) {
    for (var i = 0; i < receivemessage.length; i++) {
      let messageDecrypted = '';
      var keyAt = 0;
      let key = receivemessage[i].sentby;
      for (var j = 0; j < receivemessage[i].message.length; j++, keyAt++) {
        if (receivemessage[i].message.charCodeAt(j) <= 126) {// อังกฤษ
          if (keyAt >= key.length)  {
            keyAt = 0;
          }
          if ((receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32) < 32)) {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) + 95 - (key.charCodeAt(keyAt) - 32));
          }
          else {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32));
          }
        }
        else if(receivemessage[i].message.charCodeAt(j) >= 3585 && receivemessage[i].message.charCodeAt(j) <= 3673) {// ภาษาไทย
          if (keyAt >= key.length)  {
            keyAt = 0;
          }
          if ((receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32) < 3585)) {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) + 89 - (key.charCodeAt(keyAt) - 32));
          }
          else {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32));
          }
        }
      }
      receivemessage[i].message = messageDecrypted;
    }
    return receivemessage;
  }

  ionViewDidEnter() {
    this.chatservice.getbuddymessages();
  }

  scrollto() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 1000);
  }
  
}