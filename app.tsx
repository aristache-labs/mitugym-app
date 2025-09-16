import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from './utils/supabase';

interface Todo {
  id: number;
  title: string;
  completed?: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data: todosData, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Error fetching todos:', error?.message || 'Unknown error');
          return;
        }

        if (todosData && todosData.length > 0) {
          setTodos(todosData);
        }
      } catch (error: any) {
        console.error('Error fetching todos:', error?.message || 'Unknown error');
      }
    };

    getTodos();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Todo List</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text key={item.id}>{item.title}</Text>}
      />
    </View>
  );
}
