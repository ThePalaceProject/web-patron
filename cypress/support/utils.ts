export const BASIC_LOGIN = "http://opds-spec.org/auth/basic";
export const CLEVER_LOGIN =
  "http://librarysimplified.org/authtype/OAuth-with-intermediary";
export const SERVER_URL = "https://qa-circulation.openebooks.us/USOEI";
export const BASE_COLLECTIONS_URL = `${SERVER_URL}/groups/429`;
export const COOKIE_KEY = "CPW_AUTH_COOKIE%2Fapp";

// Base Paths
export const APP_PATH = "/app";
export const LOGIN_PATH = `${APP_PATH}/login`;
export const LOANS_PATH = `${APP_PATH}/loans`;
export const FIRSTBOOK_LOGIN_PATH = `${LOGIN_PATH}/http%3A%2F%2Fopds-spec.org%2Fauth%2Fbasic`;
export const CLEVER_LOGIN_PATH = `${LOGIN_PATH}/http%3A%2F%2Flibrarysimplified.org%2Fauthtype%2FOAuth-with-intermediary`;
const COLLECTION_PATH = `${APP_PATH}/collection`;
const BOOK_PATH = `${APP_PATH}/book`;

// All Access Paths
export const HIGH_SCHOOL_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fgroups%2F406%3Fentrypoint%3DBook`;
export const MIDDLE_GRADES_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fgroups%2F417%3Fentrypoint%3DBook`;
export const EARLY_GRADES_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fgroups%2F429%3Fentrypoint%3DBook`;
export const ALL_ACCESS_INTEGRATION_TESTING_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F440%3Fentrypoint%3DBook`;
export const ALL_ACCESS_AUTHOR_RECOMMENDATIONS_PATH_HUNTER_C_C = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2Fcontributor%2FHunter%252C%2520C.%2520C.%2Feng%2FAll%252BAges%252CChildren%252CYoung%252BAdult`;
export const ALL_ACCESS_DETAIL_BOOK_PATH_ALMOST_MIDNIGHT = `${BOOK_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0017409891`;

// High School Paths
export const HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F407%3Fentrypoint%3DBook`;
export const HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2Fcontributor%2FRush%252C%2520Jennifer%2Feng%2FAll%252BAges%252CChildren%252CYoung%252BAdult`;
export const HIGH_SCHOOL_ROMANCE_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F414%3Fentrypoint%3DBook`;
export const HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION = `${BOOK_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0013217610`;
export const HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED = `${BOOK_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0013215327`;

// Middle Grades Paths
export const MIDDLE_GRADES_STAFF_PICKS_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F418%3Fentrypoint%3DBook`;
export const MIDDLE_GRADES_COMICS_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F421%3Fentrypoint%3DBook`;
export const MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA = `${BOOK_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0014727641`;

// Early Grades Paths
export const EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH = `${COLLECTION_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F431%3Fentrypoint%3DBook`;
export const EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE = `${BOOK_PATH}/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0016687577`;
