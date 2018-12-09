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
  constructor(public navCtrl: NavController, public navParams: NavParams, public chatservice: ChatProvider,
              public events: Events, public zone: NgZone) {
    this.buddy = this.chatservice.buddy;
    this.photoURL = firebase.auth().currentUser.photoURL;
    this.scrollto();
    this.events.subscribe('newmessage', () => {
      this.allmessages = [];
      this.zone.run(() => {
        this.allmessages = this.chatservice.buddymessages;
        this.decryptViginere(this.allmessages);
      })
      
    })
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
        console.log("L is " + (key.charCodeAt(keyAt) - 32));
        console.log("เ is " + (newmessage.charCodeAt(_i) ));
        console.log(String.fromCharCode(3603));
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
          // messageEncrypt += String.fromCharCode((((newmessage.charCodeAt(_i) - 3585) + key.charCodeAt(keyAt)) % 89) + 3585);
          if ((receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32) < 3585)) {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) + 89 - (key.charCodeAt(keyAt) - 32));
            console.log(key.charCodeAt(keyAt));
          }
          else {
            messageDecrypted += String.fromCharCode(receivemessage[i].message.charCodeAt(j) - (key.charCodeAt(keyAt) - 32));
            console.log(key.charCodeAt(keyAt));
          }
        }
      }
      receivemessage[i].message = messageDecrypted;
    }
    console.log(receivemessage);
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