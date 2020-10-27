/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { SystemStyleObject } from "@styled-system/css";
import { H1, Text } from "./Text";
import withAppProps from "dataflow/withAppProps";

const OpenEbooksLandingComponent = () => {
  const props = withAppProps();

  return (
    <>
      <div
        sx={{
          backgroundImage:
            "https://openebooks.net/images/9004993292_01415d21ea_o.jpg",
          height: "400px"
        }}
      >
        Banner
      </div>
      <div>
        <H1 sx={{ fontSize: 3, textAlign: `center` }}>
          Lorem Ipsum Secondary Headline Welcome Openebooks
        </H1>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Text>
      </div>
      <div>
        <div>
          <img alt="Clever Logo" src={"/CleverLogo.png"} />
          <Text>
            Clever is the platform that powers technology in the classroom.
            Today, one in three innovative K-12 schools in the U.S. trust Clever
            to secure their student data as they adopt learning apps in the
            classroom.
          </Text>
          {/* <Button variant="filled" color="brand.primary">
            Sign in with Clever
          </Button> */}
        </div>
        <div>
          <img alt="FirstBook Logo" src={"/FirstBookLogo.png"} />
          <Text>
            First Book is a nonprofit organization that provides access to high
            quality, brand new books and educational resources - for free and at
            low cost - to schools and programs serving children in need.
          </Text>
          {/* <Button variant="filled" color="brand.primary">
            Sign in with First Book
          </Button> */}
        </div>
      </div>
      <div
        sx={{
          backgroundColor: "brand.primary",
          height: "300px"
        }}
      >
        Mobile
      </div>
      <div>Popular</div>
      <div>Faq</div>
    </>
  );
};

const bannerBase: SystemStyleObject = {};

export default OpenEbooksLandingComponent;
