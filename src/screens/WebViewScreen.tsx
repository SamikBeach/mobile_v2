import React, { useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';

const MIYUK_BOOKS_URL = 'https://miyukbooks.com/';

export default function WebViewScreen(): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    console.log('Navigation:', navState.url);
  };

  if (hasError) {
    return <ErrorView onRetry={handleRetry} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />
      {isLoading && <LoadingView />}
      <WebView
        ref={webViewRef}
        source={{ uri: MIYUK_BOOKS_URL }}
        style={[styles.webview, isLoading && styles.hidden]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={true}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        userAgent='Mozilla/5.0 (Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
        onHttpError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP Error:', nativeEvent);
          handleError();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
