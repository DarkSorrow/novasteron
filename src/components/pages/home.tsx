import { useLayoutEffect } from 'react';
import { Base } from '../templates/base';
import { useTranslation } from 'react-i18next';
import { Outlet } from "react-router-dom";

/**
 * Home page
 * Should handle model selection,
 * menu on the side with a + button to add a new model, and below the list of existing models
 * top is a two state
 *     - No model / Add model -> logo and novasteron in the middle center
 *     - Model selected -> model name in the middle, unload button, settings <button className="
 *   (Maybe the top later can be moved to electron header)
 * 
 * center is the page that change according the the model
 *  
 * @returns 
 * 
 */

export const Home = () => {
  useLayoutEffect(() => { // remove the splash screen after dom load
    if (window.splashScreen) {
      console.log("Splash screen found");
      window.splashScreen.appReady();
    }
  }, []);

  return (
    <Base 
      sideBar={<div>Sidebar</div> /* Should have the add model and the list of models */}
      header={<div>Header</div> /* Novastera in the middle or menuof the model */}
    >
      <Outlet />
    </Base>
  );
}