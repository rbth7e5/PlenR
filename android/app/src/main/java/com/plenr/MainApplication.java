package com.plenr;

import android.app.Application;

import com.facebook.react.ReactApplication;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativenavigation.bridge.NavigationReactPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.calendarevents.CalendarEventsPackage;
import com.calendarevents.CalendarEventsPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.calendarevents.CalendarEventsPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

import com.reactnativenavigation.NavigationApplication;

public class MainApplication extends NavigationApplication {

     @Override
     public boolean isDebug() {
         // Make sure you are using BuildConfig from your own application
         return BuildConfig.DEBUG;
     }

     protected List<ReactPackage> getPackages() {
         // Add additional packages you require here
         // No need to add RnnPackage and MainReactPackage
         return Arrays.<ReactPackage>asList(
             // eg. new VectorIconsPackage()
             // new MainReactPackage(),
            new RNGoogleSigninPackage(),
            new VectorIconsPackage(),
            new NavigationReactPackage(),
            new RNFirebasePackage(),
            new CalendarEventsPackage()
         );
     }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }

     @Override
     public String getJSMainModuleName() {
       return "index";
     }
 }