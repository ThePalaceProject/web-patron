
import * as React from "react";
import styled from "@emotion/styled"

const SearchForm = styled.form`
    display: inline-block;
    position: absolute;
    bottom: 20px;
    right: 20px;
`
SearchForm.defaultProps = {
    role: "search"
}

const SearchInput = styled.input`
    border-radius: 10px;
    border-color: #343434;
    padding: 8px;
    border-width: 1px;
`
SearchInput.defaultProps = {
    type: "text",
    name: "search",
    title: "Search",
    placeholder: "Search"
}

const SearchButton = styled.button`
    -webkit-appearance: none;
    background: #343434;
    color: white;
    border: none;
    padding: 10px;
    margin-left: 20px;
    border-radius: 10px;
    text-transform: uppercase;
    font-size: 0.9em;
    font-weight: bold;

`
SearchButton.defaultProps = {
    type: "submit"
}

export const Search = (props) => {

    return <SearchForm>
        <SearchInput />
        <SearchButton>Search</SearchButton>
    </SearchForm>

}