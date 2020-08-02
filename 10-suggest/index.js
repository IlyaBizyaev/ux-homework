'use strict';

const searchForm = document.getElementById('search');
const searchField = document.getElementById('search-field');
const searchClearButton = document.getElementById('search-clear');
const searchSubmitButton = document.getElementById('search-submit');
const searchSuggest = document.getElementById('search-suggest');

let suggestionsAndListeners = [];
let focusedSuggestionIndex = 0;
let maxSuggestionIndex = 0;

function debounce(callback, interval) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);

    return new Promise(resolve => {
      timer = setTimeout(() => resolve(callback(...args)), interval);
    });
  };
}

function clearSearchField() {
  searchField.value = '';
  applySearhbarStyles(true);
  searchField.focus();
}

function substituteSuggestion(suggestion) {
  return function() {
    searchField.value = suggestion;
  };
}

function setSuggestions(suggestionList) {
  if (suggestionList.length === 0) {
    searchSuggest.classList.remove('search__suggest_active');
  } else {
    for (const oldSuggestion of suggestionsAndListeners) {
      const node = oldSuggestion.suggestion;
      const listener = oldSuggestion.listener;
      node.removeEventListener('click', listener);
      node.parentNode.removeChild(node);
    }
    suggestionsAndListeners = [];
    maxSuggestionIndex = suggestionList.length;
    let suggestionIndex = 1;
    for (const suggestion of suggestionList) {
      const suggestionNode = document.createElement('button');
      suggestionNode.id = `suggestion${suggestionIndex++}`;
      suggestionNode.classList.add('search__result');
      suggestionNode.append(suggestion);
      const listener = substituteSuggestion(suggestion);
      suggestionNode.addEventListener('click', listener);
      suggestionsAndListeners.push({ suggestion: suggestionNode, listener: listener });
      searchSuggest.appendChild(suggestionNode);
    }
    searchSuggest.classList.add('search__suggest_active');
  }
}

function suggestionFromJson(data) {
  return `${data.code}, ${data.name} (${data.country_name})`;
}

function fetchAndSetSuggestions(term) {
  if (term.length === 0) {
    setSuggestions([]);

    return;
  }
  const apiUrl = `https://places.aviasales.ru/v2/places.json?locale=en&max=5&term=${term}&types[]=city&types[]=airport`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(reponseObject => reponseObject.map(result => suggestionFromJson(result)))
    .then(suggestions => setSuggestions(suggestions))
    .catch(error => console.error(`Failed to get API reponse: ${error}`));
}

function applySearhbarStyles(isEmpty) {
  if (isEmpty) {
    searchClearButton.classList.remove('search__clear_active');
    searchSubmitButton.classList.remove('search__submit_active');
    searchSuggest.classList.remove('search__suggest_active');
    searchClearButton.disabled = true;
  } else {
    searchClearButton.classList.add('search__clear_active');
    searchSubmitButton.classList.add('search__submit_active');
    searchClearButton.disabled = false;
  }
}

function handleSearhbarKeys(event) {
  if (event.key === 'ArrowDown' && focusedSuggestionIndex < maxSuggestionIndex) {
    focusedSuggestionIndex++;
    document.getElementById(`suggestion${focusedSuggestionIndex}`).focus();
  } else if (event.key === 'ArrowUp') {
    if (focusedSuggestionIndex > 0) {
      --focusedSuggestionIndex;
    }
    if (focusedSuggestionIndex > 0) {
      document.getElementById(`suggestion${focusedSuggestionIndex}`).focus();
    } else {
      searchField.focus();
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const debouncedFetchAndSetSuggestions = debounce(fetchAndSetSuggestions, 300, false);
  searchField.addEventListener('input', e => {
    const isSearchbarEmpty = e.target.value.length === 0;
    applySearhbarStyles(isSearchbarEmpty);
  });
  searchField.addEventListener('input', e => debouncedFetchAndSetSuggestions(e.target.value));
  searchClearButton.addEventListener('click', clearSearchField);
  searchForm.addEventListener('keydown', handleSearhbarKeys);
});
