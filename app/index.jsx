import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext, useEffect } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";
import Octicons from '@expo/vector-icons/Octicons'
import { data } from "@/data/todos"
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Animated, { Layout, LinearTransition } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext)
  const router = useRouter()

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  // טעינת הנתונים והעדפות התצוגה
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // טעינת רשימת המשימות
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        if (jsonValue !== null) {
          const storageTodos = JSON.parse(jsonValue);
          setTodos(storageTodos.sort((a, b) => b.id - a.id));
        } else {
          setTodos(data.sort((a, b) => b.id - a.id));
        }

        // טעינת העדפת התצוגה
        const savedColorScheme = await AsyncStorage.getItem("TodoAppTheme");
        if (savedColorScheme !== null) {
          // קריאה לפונקציה שמשנה את ערכת הנושא
          // אנחנו מניחים ש-setColorScheme מקבל את הערך החדש או מחליף בין 'light' ל-'dark'
          if (savedColorScheme !== colorScheme) {
            setColorScheme(savedColorScheme);
          }
        }
      } catch (e) {
        console.error("Error loading data:", e);
        setTodos(data.sort((a, b) => b.id - a.id));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // רק בטעינה ראשונית

  // שמירת רשימת המשימות כשהיא משתנה
  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todos);
        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (e) {
        console.error("Error saving todos:", e);
      }
    };

    if (!isLoading) {
      storeData();
    }
  }, [todos, isLoading]);

  // שמירת העדפת התצוגה כשהיא משתנה
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem("TodoAppTheme", colorScheme);
      } catch (e) {
        console.error("Error saving theme preference:", e);
      }
    };

    if (!isLoading) {
      saveThemePreference();
    }
  }, [colorScheme, isLoading]);

  if (!loaded && !error) {
    return null
  }

  // Use theme and colorScheme directly here, not ThemeContext
  const styles = createStyles(theme, colorScheme)

  // פונקציה מותאמת לשינוי ערכת הנושא
  const toggleColorScheme = () => {
    // קוראים לפונקציה המקורית לשינוי ערכת הנושא
    setColorScheme();
  };

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([{ id: newId, title: text, completed: false }, ...todos]);
      setText('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? {
      ...todo,
      completed: !todo.completed
    } : todo))
  }

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handlePress = (id) => {
   router.push(`/todos/${id}`)
  }


  const renderItem = ({ item }) => (
    <Animated.View layout={Layout.springify()} style={styles.todoItem}>
      <Pressable
        onPress={() => handlePress(item.id)}
        onLongPress={() => toggleTodo(item.id)}>
        <Text
          style={[styles.todoText, item.completed && styles.completedText]}
      >
        {item.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => removeTodo(item.id)}>
        <MaterialCommunityIcons name="delete-circle" size={36} color="red" selectable={undefined} />
      </Pressable>
    </Animated.View>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>טוען משימות...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          maxLength={30}
          placeholder="Add a new todo"
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
        />
        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>

        <Pressable
          onPress={toggleColorScheme}
          style={{ marginLeft: 10 }}
        >
          {colorScheme === 'dark' ? (
            <Octicons
              name="moon"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          ) : (
            <Octicons
              name="sun"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          )}
        </Pressable>
      </View>

      <Animated.FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={todo => todo.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
        layout={Layout}
      />
      <StatusBar style= {colorScheme=== 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },

    loadingText: {
      fontSize: 18,
      color: theme.text,
      fontFamily: 'Inter_500Medium',
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      padding: 10,
      width: '100%',
      maxWidth: 1024,
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },

    input: {
      flex: 1,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      minWidth: 0,
      color: theme.text,
    },

    addButton: {
      backgroundColor: theme.button,
      borderRadius: 5,
      padding: 10,
    },
    addButtonText: {
      fontSize: 18,
      color: colorScheme === 'dark' ? 'black' : 'white',
    },

    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
      padding: 10,
      borderBottomColor: 'gray',
      borderBottomWidth: 1,
      width: '100%',
      maxWidth: 1024,
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },

    todoText: {
      flex: 1,
      fontSize: 18,
      color: theme.text,
      fontFamily: 'Inter_500Medium',
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: 'gray',
    },
  })
}