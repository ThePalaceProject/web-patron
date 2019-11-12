import * as React from "react";
import styled from "../styled";

type NavBarProps = {
  bg?: string
};
export const NavBar = styled("div") <NavBarProps>`
    position: relative;
    height: 150px;
    margin: 0;
    color: ${props => props.color || "#343434"};
    background: ${props => props.bg || "white"};
    border: none;
`;
NavBar.defaultProps = {
  role: "navigation"
};

type NavHeaderProps = {
  bg?: string
};
export const NavHeader = styled("div") <NavHeaderProps>`
    position: relative;
    display: inline-block;
    width: 200px;
    height: 100%;
    color: ${props => props.color || "white"};
    background: ${props => props.bg || "#1e1e1e"};
`;

export const NavBrand = styled.div`
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
`;

export const NavBrandTitle = styled.div`
    font-size: 1.5em;
    font-weight: bold;
    line-height: 1;
`;

export const NavBrandSubtitle = styled.div`
    font-size: 1.1em;
    margin-top: 10px;
`;

export const NavToggle = styled.div`

`;

export const NavCollapse = styled.div`
    position: relative;
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 200px);
`;

export const NavList = styled.div`
    display: inline-block;
    position: absolute;
    left: 0;
    bottom: 0;

    li {
        display: inline-block;
        padding: 15px;
        background: #343434;
        margin-left: 4px;
        border-radius: 8px 8px 0 0;
        font-size: 1.25em;
    }

`;