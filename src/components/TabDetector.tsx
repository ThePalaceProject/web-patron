// /** @jsx jsx */
// import { jsx, Styled, Flex } from "theme-ui";
// import * as React from "react";

// /**
//  * Detects a user who is tabbing around the site
//  * in order to provide styles for them.
//  * Maybe this should put the styles in globalstyles? Or elsewhere?
//  * What's the best api for this?
//  */
// const TabDetector: React.FC = ({ children }) => {
//   const [isTabbing, setTabbing] = React.useState(false);

//   // detect if the user is tabbing
//   React.useEffect(() => {
//     // set the listener for it
//     const handleFistTab = (e: KeyboardEvent) => {
//       if (e.keyCode === 9) {
//         setTabbing(true);
//         window.removeEventListener("keydown", handleFistTab);
//       }
//     };
//     window.addEventListener("keydown", handleFistTab);
//   });

//   // set some sort of style

//   return (
//     <React.Fragment>
//       <style></style>
//       {children}
//     </React.Fragment>
//   );
// };

// export default TabDetector;
