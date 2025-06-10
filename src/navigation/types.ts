export type MainTabParamList = {
  Home: undefined;
  Popular: undefined;
  Discover: undefined;
  Community: undefined;
  Libraries: undefined;
  My: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  BookDetail: { bookId: string };
  LibraryDetail: undefined;
  Search: undefined;
  Notification: undefined;
};
