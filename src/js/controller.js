import * as model from './model.js';
import { MODAL_CLOSE_SECONDS } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    
    //render spinner
    recipeView.renderSpinner();
    
    //update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    
    //render the bookmarks
    bookmarksView.render(model.state.bookmarks);

    //loading recipe
    await model.loadRecipe(id);
    
    //rendering the recipes
    recipeView.render(model.state.recipe);

    //updating bookmarks view    
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //get search query
    const query = searchView.getQuery();
    if (!query) return;
    //load search results
    await model.loadSearchResults(query);
    //render results
    resultsView.render(model.getSearchResultsPage());
    //render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //render new pagination
  paginationView.render(model.state.search);
    
}

const controlServings = function(newServings) {
  //update the recipe servings in state
  model.updateServings(newServings);


  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookMark = function() {
  //add or remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeView.update(model.state.recipe);
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try { 
    //show loading spinner
    addRecipeView.renderSpinner();

  //upload new recipe data
  await model.uploadRecipe(newRecipe);
  console.log(model.state.recipe);

  //render recipe
  recipeView.render(model.state.recipe);

  //success message
  addRecipeView.renderMessage();

  //render bookmark view
  bookmarksView.render(model.state.bookmarks);

  //change ID in URL
  window.history.pushState(null, '', `#${model.state.recipe.id}`);
  
  //close form window
  setTimeout(function() {
    addRecipeView.toggleWindow()
  }, MODAL_CLOSE_SECONDS * 1000);
  } catch(err) {
    console.error('!!!!!', err);
    addRecipeView.renderError(err.message);
  }
}



const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
