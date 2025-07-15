import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { NostrRelay } from './utils/nostrClient';
import { PermissionsAndroid } from 'react-native';

const { width, height } = Dimensions.get('window');

const EMFSleepGuardian = () => {
  const [settings, setSettings] = useState({
    wifiReminder: true,
    phoneDistance: true,
    microwaveReminder: true,
    tvReminder: true,
    bedtime: '22:00',
    reminderTime: '21:30',
    nostrEnabled: false,
    nostrRelay: 'wss://relay.damus.io',
  });
  
  const [healthScore, setHealthScore] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [nostrClient, setNostrClient] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApp();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const initializeApp = async () => {
    await requestPermissions();
    await loadSettings();
    setupNotifications();
    calculateHealthScore();
    checkDailyReset();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'EMF Sleep Guardian Notification Permission',
            message: 'This app needs access to notifications to remind you about healthy sleep habits.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      checkDailyReset();
      calculateHealthScore();
    }
    setAppState(nextAppState);
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('emfSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        
        if (parsedSettings.nostrEnabled) {
          await setupNostr(parsedSettings.nostrRelay);
        }
      }
      
      const streak = await AsyncStorage.getItem('streakDays');
      if (streak) {
        setStreakDays(parseInt(streak));
      }

      const tasks = await AsyncStorage.getItem('completedTasks');
      if (tasks) {
        const today = new Date().toDateString();
        const savedTasks = JSON.parse(tasks);
        if (savedTasks.date === today) {
          setCompletedTasks(savedTasks.tasks);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('emfSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const setupNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (notification.userInteraction) {
          handleNotificationTap(notification.id);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    scheduleReminders();
  };

  const handleNotificationTap = (notificationId) => {
    switch (notificationId) {
      case '1':
        break;
      case '2':
        break;
      case '3':
        break;
    }
  };

  const setupNostr = async (relayUrl = 'wss://relay.damus.io') => {
    try {
      const client = new NostrRelay(relayUrl);
      await client.connect();
      setNostrClient(client);
      
      client.subscribe([
        {
          kinds: [1],
          '#t': ['emf-health', 'sleep-optimization'],
        },
      ]);
    } catch (error) {
      console.error('Nostr connection error:', error);
    }
  };

  const scheduleReminders = () => {
    PushNotification.cancelAllLocalNotifications();
    
    const now = new Date();
    const reminderTime = new Date();
    const [hours, minutes] = settings.reminderTime.split(':');
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const notifications = [
      {
        id: '1',
        title: '🌙 EMF Sleep Prep Time!',
        message: 'Time to start your healthy sleep routine',
        date: reminderTime,
        soundName: 'default',
        playSound: true,
      },
      {
        id: '2',
        title: '📶 WiFi Router Reminder',
        message: 'Remember to turn off your WiFi router for better sleep',
        date: new Date(reminderTime.getTime() + 5 * 60000),
        soundName: 'default',
        playSound: true,
      },
      {
        id: '3',
        title: '📱 Phone Distance Check',
        message: 'Move your phone at least 6 feet away from your bed',
        date: new Date(reminderTime.getTime() + 10 * 60000),
        soundName: 'default',
        playSound: true,
      },
    ];

    notifications.forEach(notif => {
      PushNotification.localNotificationSchedule({
        ...notif,
        repeatType: 'day',
        actions: ['Complete', 'Remind Later'],
      });
    });
  };

  const calculateHealthScore = () => {
    const maxScore = 100;
    let score = 0;
    
    if (completedTasks.includes('wifi')) score += 25;
    if (completedTasks.includes('phone')) score += 25;
    if (completedTasks.includes('microwave')) score += 25;
    if (completedTasks.includes('tv')) score += 25;
    
    setHealthScore(score);
    
    if (score === maxScore) {
      updateStreak();
    }
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const lastStreakDate = await AsyncStorage.getItem('lastStreakDate');
    
    if (lastStreakDate !== today) {
      const newStreak = streakDays + 1;
      setStreakDays(newStreak);
      await AsyncStorage.setItem('streakDays', newStreak.toString());
      await AsyncStorage.setItem('lastStreakDate', today);
    }
  };

  const checkDailyReset = async () => {
    const today = new Date().toDateString();
    const lastResetDate = await AsyncStorage.getItem('lastResetDate');
    
    if (lastResetDate !== today) {
      setCompletedTasks([]);
      setHealthScore(0);
      await AsyncStorage.setItem('lastResetDate', today);
      await AsyncStorage.removeItem('completedTasks');
    }
  };

  const completeTask = async (taskId) => {
    if (!completedTasks.includes(taskId)) {
      const newCompleted = [...completedTasks, taskId];
      setCompletedTasks(newCompleted);
      
      const today = new Date().toDateString();
      await AsyncStorage.setItem('completedTasks', JSON.stringify({
        date: today,
        tasks: newCompleted
      }));
      
      const celebrations = [
        '🎉 Excellent work! Your sleep health is improving!',
        '✨ Great job reducing EMF exposure!',
        '🌙 You\'re on your way to better sleep!',
        '💪 Keep up the healthy habits!',
      ];
      
      Alert.alert(
        '🎉 Task Complete!',
        celebrations[Math.floor(Math.random() * celebrations.length)],
        [{ text: 'Continue', style: 'default' }]
      );
      
      if (settings.nostrEnabled && nostrClient) {
        sendNostrUpdate(taskId);
      }
    }
  };

  const sendNostrUpdate = async (taskId) => {
    try {
      const taskNames = {
        wifi: 'WiFi Router Shutdown',
        phone: 'Phone Distance',
        microwave: 'Stovetop Cooking',
        tv: 'Smart TV Shutdown'
      };
      
      const event = {
        kind: 1,
        content: `Just completed ${taskNames[taskId]} task for better EMF sleep health! 🌙 Score: ${healthScore + 25}/100 #emf-health #sleep-optimization`,
        tags: [['t', 'emf-health'], ['t', 'sleep-optimization']],
        created_at: Math.floor(Date.now() / 1000),
      };
      
      await nostrClient.publish(event);
    } catch (error) {
      console.error('Nostr publish error:', error);
    }
  };

  const resetDailyTasks = async () => {
    Alert.alert(
      'Reset Daily Tasks',
      'Are you sure you want to reset today\'s progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setCompletedTasks([]);
            setHealthScore(0);
            await AsyncStorage.removeItem('completedTasks');
          }
        }
      ]
    );
  };

  const TaskCard = ({ title, description, taskId, icon, completed }) => (
    <TouchableOpacity
      style={[styles.taskCard, completed && styles.completedTask]}
      onPress={() => completeTask(taskId)}
      disabled={completed}
      activeOpacity={0.8}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskIcon}>{icon}</Text>
        <Text style={styles.taskTitle}>{title}</Text>
        {completed && <Text style={styles.checkmark}>✅</Text>}
      </View>
      <Text style={styles.taskDescription}>{description}</Text>
      
      {!completed && (
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const HealthMeter = () => (
    <View style={styles.healthMeter}>
      <Text style={styles.healthTitle}>Sleep Health Score</Text>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreText}>{healthScore}</Text>
        <Text style={styles.scoreLabel}>/ 100</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${healthScore}%` }]} />
      </View>
      <Text style={styles.streakText}>🔥 {streakDays} day streak</Text>
    </View>
  );

  const EducationalTips = () => (
    <View style={styles.tipsSection}>
      <Text style={styles.sectionTitle}>💡 Why This Matters</Text>
      
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>WiFi & Sleep Quality</Text>
        <Text style={styles.tipText}>
          WiFi signals can interfere with melatonin production and disrupt 
          your natural sleep cycles. Turning off your router creates a 
          more peaceful electromagnetic environment.
        </Text>
      </View>
      
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Phone Distance & EMF</Text>
        <Text style={styles.tipText}>
          Cell phones emit radiofrequency radiation even when not in use. 
          Keeping your phone at least 6 feet away reduces exposure and 
          improves sleep quality.
        </Text>
      </View>
      
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Microwave Concerns</Text>
        <Text style={styles.tipText}>
          Microwaves can leak electromagnetic radiation and may affect 
          food nutrition. Stovetop cooking is healthier and creates no 
          EMF exposure in your kitchen.
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>🌙 EMF Sleep Guardian</Text>
          <Text style={styles.subtitle}>Your healthy sleep companion</Text>
        </View>
        
        <HealthMeter />
        
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Tonight's Tasks</Text>
          
          <TaskCard
            title="Turn Off WiFi Router"
            description="Power down your WiFi router to reduce EMF exposure while sleeping"
            taskId="wifi"
            icon="📶"
            completed={completedTasks.includes('wifi')}
          />
          
          <TaskCard
            title="Move Phone Away"
            description="Place your phone at least 6 feet from your bed"
            taskId="phone"
            icon="📱"
            completed={completedTasks.includes('phone')}
          />
          
          <TaskCard
            title="Turn Off Smart TV"
            description="Power down WiFi-enabled TVs and streaming devices"
            taskId="tv"
            icon="📺"
            completed={completedTasks.includes('tv')}
          />
          
          <TaskCard
            title="Microwave Reminder"
            description="Remember: Use stovetop cooking for better health"
            taskId="microwave"
            icon="🍳"
            completed={completedTasks.includes('microwave')}
          />
        </View>
        
        <EducationalTips />
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Nostr Updates</Text>
            <Switch
              value={settings.nostrEnabled}
              onValueChange={async (value) => {
                const newSettings = { ...settings, nostrEnabled: value };
                await saveSettings(newSettings);
                if (value) {
                  await setupNostr(settings.nostrRelay);
                } else {
                  setNostrClient(null);
                }
              }}
              trackColor={{ false: '#767577', true: '#4a90e2' }}
              thumbColor={settings.nostrEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetDailyTasks}
          >
            <Text style={styles.resetButtonText}>Reset Daily Tasks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={scheduleReminders}
          >
            <Text style={styles.scheduleButtonText}>Update Reminders</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sleep better, live healthier 🌙
          </Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#16213e',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  healthMeter: {
    margin: 20,
    padding: 20,
    backgroundColor: '#0f3460',
    borderRadius: 15,
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 4,
  },
  streakText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tasksSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedTask: {
    backgroundColor: '#1a4a3a',
    borderColor: '#4a90e2',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
  },
  taskDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 15,
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipsSection: {
    margin: 20,
  },
  tipCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  settingsSection: {
    margin: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scheduleButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
});

export default EMFSleepGuardian;