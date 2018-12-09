import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import { usercreds } from '../../models/interfaces/usercreds';

import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  credentials = {} as usercreds;
  constructor(public navCtrl: NavController, public navParams: NavParams, public authservice: AuthProvider, public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    var count = 1;
    for(var _i = 3585; _i < 3674; _i++) {
      console.log(_i + " " + String.fromCharCode(_i) + count++)
    }
  }

  signin() {
    var toaster = this.toastCtrl.create({
      duration: 3000,
      position: 'bottom'
    });
    if (this.credentials.email == null || this.credentials.password == null) {
      toaster.setMessage('All fields are required');
      toaster.present();
    }
    else {
    this.authservice.login(this.credentials).then((res: any) => {
      if (!res.code)
        this.navCtrl.setRoot('TabsPage');
      else {
        alert(res);
      }
    })
    }
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  passwordreset() {
    this.navCtrl.push('PasswordresetPage');
  }

}