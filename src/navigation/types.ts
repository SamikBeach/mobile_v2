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
  BookDetail: { isbn: string; title?: string };
  LibraryDetail: { libraryId: number };
  Search: undefined;
  AddBook: { libraryId?: number; onBookSelect?: (book: any) => void };
  Notification: undefined;
  Feedback: undefined;
  User: undefined;
  Profile: { userId?: number; section?: string };
};
