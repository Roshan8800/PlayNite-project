# 6. Implementation Specifications

## Executive Summary

This document provides detailed technical specifications for implementing the 45+ missing features identified in the PlayNite platform analysis. Each feature includes implementation requirements, API specifications, database schema changes, and testing criteria.

## Critical Missing Pages Implementation

### 1. About Us Page (`/about`)

**Technical Specifications:**
```typescript
// Page structure
interface AboutPageProps {
  team: TeamMember[];
  stats: PlatformStats;
  mission: MissionStatement;
}

// Component implementation
function AboutPage() {
  const { data: aboutData } = useQuery({
    queryKey: ['about'],
    queryFn: () => fetchAboutData(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return (
    <div className="about-page">
      <HeroSection mission={aboutData.mission} />
      <StatsSection stats={aboutData.stats} />
      <TeamSection team={aboutData.team} />
      <ContactCTA />
    </div>
  );
}

// Database schema
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  twitter?: string;
}

interface PlatformStats {
  totalUsers: number;
  totalVideos: number;
  totalViews: number;
  countriesServed: number;
}
```

**API Endpoints:**
```typescript
// GET /api/about
export async function GET() {
  const [team, stats] = await Promise.all([
    getTeamMembers(),
    getPlatformStats()
  ]);

  return NextResponse.json({ team, stats });
}
```

**SEO Requirements:**
- Structured data (Organization schema)
- Open Graph meta tags
- Canonical URL implementation

### 2. Enhanced Help System (`/help`)

**Technical Specifications:**
```typescript
// Help system architecture
interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: HelpCategory;
  tags: string[];
  relatedArticles: string[];
  lastUpdated: Timestamp;
}

enum HelpCategory {
  GETTING_STARTED = 'getting-started',
  VIDEO_PLAYBACK = 'video-playback',
  ACCOUNT_MANAGEMENT = 'account-management',
  TROUBLESHOOTING = 'troubleshooting',
  BILLING = 'billing'
}

// Search functionality
function useHelpSearch(query: string) {
  return useQuery({
    queryKey: ['help-search', query],
    queryFn: () => searchHelpArticles(query),
    enabled: query.length > 2,
  });
}

// Interactive FAQ component
function InteractiveFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  return (
    <div className="faq-accordion">
      {faqs.map(faq => (
        <AccordionItem
          key={faq.id}
          isOpen={openItems.has(faq.id)}
          onToggle={() => toggleItem(faq.id)}
        >
          <AccordionHeader>{faq.question}</AccordionHeader>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </div>
  );
}
```

**Database Schema:**
```typescript
// Help articles collection
interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  relatedArticles: string[];
  viewCount: number;
  helpfulCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User feedback on articles
interface ArticleFeedback {
  articleId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: Timestamp;
}
```

## Video Player Enhancements

### 3. Adaptive Streaming Implementation

**Technical Specifications:**
```typescript
// Adaptive streaming manager
class AdaptiveStreamingManager {
  private hls: Hls | null = null;
  private video: HTMLVideoElement;
  private connectionMonitor: ConnectionMonitor;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.connectionMonitor = new ConnectionMonitor();
    this.initializeAdaptiveStreaming();
  }

  private async initializeAdaptiveStreaming() {
    const videoUrl = await this.getOptimalVideoUrl();
    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });

    this.hls.loadSource(videoUrl);
    this.hls.attachMedia(this.video);

    this.setupQualityMonitoring();
    this.setupConnectionAdaptation();
  }

  private setupQualityMonitoring() {
    this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      const quality = this.hls.levels[data.level];
      analytics.track('quality_change', {
        from: data.level,
        to: quality.height,
        reason: 'adaptive'
      });
    });
  }

  private setupConnectionAdaptation() {
    this.connectionMonitor.onChange((connection) => {
      if (connection.downlink < 1) {
        this.hls.currentLevel = 0; // Lowest quality
      } else if (connection.downlink > 5) {
        this.hls.currentLevel = -1; // Auto quality
      }
    });
  }

  private async getOptimalVideoUrl(): Promise<string> {
    const connection = await this.connectionMonitor.getConnection();
    const userPreferences = await this.getUserQualityPreference();

    // Select optimal manifest based on connection and preferences
    return this.selectManifestUrl(connection, userPreferences);
  }
}

// Quality selector component
function QualitySelector({ qualities, currentQuality, onQualityChange }) {
  return (
    <Select value={currentQuality} onValueChange={onQualityChange}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {qualities.map(quality => (
          <SelectItem key={quality.level} value={quality.level}>
            {quality.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**API Integration:**
```typescript
// GET /api/videos/{id}/manifest
export async function GET(request: NextRequest, { params }) {
  const { id } = params;
  const userAgent = request.headers.get('user-agent');
  const connection = request.headers.get('save-data') || 'normal';

  // Generate adaptive manifest based on device and connection
  const manifest = await generateAdaptiveManifest(id, {
    userAgent,
    connection,
    supportedFormats: ['hls', 'dash']
  });

  return new NextResponse(manifest, {
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

### 4. Picture-in-Picture (PiP) Mode

**Technical Specifications:**
```typescript
// PiP manager
class PictureInPictureManager {
  private video: HTMLVideoElement;
  private pipWindow: Window | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.initializePiP();
  }

  private initializePiP() {
    if ('pictureInPictureEnabled' in document) {
      this.video.addEventListener('enterpictureinpicture', this.onEnterPiP);
      this.video.addEventListener('leavepictureinpicture', this.onLeavePiP);
    }
  }

  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP toggle failed:', error);
      // Fallback for unsupported browsers
      this.showPiPFallback();
    }
  }

  private onEnterPiP = () => {
    this.pipWindow = document.pictureInPictureElement as any;
    this.setupPiPControls();
    analytics.track('pip_entered');
  };

  private onLeavePiP = () => {
    this.pipWindow = null;
    analytics.track('pip_exited');
  };

  private setupPiPControls() {
    if (this.pipWindow) {
      // Create custom PiP controls
      const controls = document.createElement('div');
      controls.innerHTML = `
        <button onclick="playPause()">⏯️</button>
        <button onclick="skip(10)">⏭️</button>
        <button onclick="closePiP()">✕</button>
      `;
      this.pipWindow.document.body.appendChild(controls);
    }
  }
}

// PiP toggle component
function PictureInPictureToggle({ video }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsSupported('pictureInPictureEnabled' in document);

    const handleEnter = () => setIsActive(true);
    const handleLeave = () => setIsActive(false);

    document.addEventListener('enterpictureinpicture', handleEnter);
    document.addEventListener('leavepictureinpicture', handleLeave);

    return () => {
      document.removeEventListener('enterpictureinpicture', handleEnter);
      document.removeEventListener('leavepictureinpicture', handleLeave);
    };
  }, []);

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => video.requestPictureInPicture()}
      disabled={isActive}
      aria-label={isActive ? "Exit Picture-in-Picture" : "Enter Picture-in-Picture"}
    >
      <PictureInPicture className="w-4 h-4" />
    </Button>
  );
}
```

### 5. Subtitle Support System

**Technical Specifications:**
```typescript
// Subtitle manager
class SubtitleManager {
  private video: HTMLVideoElement;
  private track: TextTrack | null = null;
  private cues: VTTCue[] = [];

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async loadSubtitles(url: string, language: string) {
    try {
      const response = await fetch(url);
      const vttContent = await response.text();

      // Remove existing track
      if (this.track) {
        this.video.textTracks.removeTrack(this.track);
      }

      // Create new track
      this.track = this.video.addTextTrack('subtitles', language, language);
      this.track.mode = 'showing';

      // Parse VTT content
      this.parseVTT(vttContent);

      analytics.track('subtitles_loaded', { language });
    } catch (error) {
      console.error('Failed to load subtitles:', error);
    }
  }

  private parseVTT(vttContent: string) {
    const lines = vttContent.split('\n');
    let currentCue: Partial<VTTCue> | null = null;

    for (const line of lines) {
      if (line.includes('-->')) {
        // Time range line
        const [start, end] = line.split(' --> ').map(parseTime);
        currentCue = { startTime: start, endTime: end, text: '' };
      } else if (line.trim() === '' && currentCue) {
        // End of cue
        if (this.track && currentCue.text) {
          const cue = new VTTCue(
            currentCue.startTime!,
            currentCue.endTime!,
            currentCue.text
          );
          this.track.addCue(cue);
          this.cues.push(cue);
        }
        currentCue = null;
      } else if (currentCue) {
        // Cue text
        currentCue.text += line + '\n';
      }
    }
  }

  setPosition(position: 'top' | 'bottom' | 'middle') {
    if (this.track) {
      this.track.position = position === 'top' ? 10 : position === 'bottom' ? 90 : 50;
    }
  }

  setFontSize(size: number) {
    // Apply CSS custom properties for subtitle styling
    this.video.style.setProperty('--subtitle-font-size', `${size}px`);
  }
}

// Subtitle selector component
function SubtitleSelector({ availableSubtitles, currentSubtitle, onSubtitleChange }) {
  return (
    <Select value={currentSubtitle} onValueChange={onSubtitleChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Subtitles" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="off">Off</SelectItem>
        {availableSubtitles.map(sub => (
          <SelectItem key={sub.lang} value={sub.lang}>
            {sub.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function parseTime(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':');
  const [secs, ms] = seconds.split('.');
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms || '0') / 1000;
}
```

## AI Features Implementation

### 6. AI Chatbot Support

**Technical Specifications:**
```typescript
// AI Chatbot service
class AIChatbotService {
  private genkit: Genkit;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.genkit = new Genkit({
      plugins: [googleAI()],
    });
  }

  async sendMessage(message: string, context: ChatContext): Promise<ChatResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    try {
      // Generate AI response
      const response = await this.generateResponse(message, context);

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        suggestions: response.suggestions
      });

      return response;
    } catch (error) {
      console.error('AI Chatbot error:', error);
      return {
        message: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        suggestions: ['Contact Support', 'Browse FAQ']
      };
    }
  }

  private async generateResponse(message: string, context: ChatContext): Promise<ChatResponse> {
    const prompt = this.buildPrompt(message, context);

    const result = await this.genkit.flows.generateContent({
      prompt,
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 500
    });

    return this.parseResponse(result);
  }

  private buildPrompt(message: string, context: ChatContext): string {
    return `
You are PlayNite's AI support assistant. Help users with video streaming questions.

Context:
- User: ${context.userName || 'Anonymous'}
- Current page: ${context.currentPage}
- User history: ${context.recentActivity?.join(', ') || 'None'}

User question: ${message}

Provide a helpful, concise response. Include relevant links or suggestions when appropriate.
    `;
  }

  private parseResponse(result: any): ChatResponse {
    const content = result.content();

    // Extract suggestions from response
    const suggestions = this.extractSuggestions(content);

    return {
      message: content,
      suggestions
    };
  }

  private extractSuggestions(content: string): string[] {
    // Simple extraction of quoted suggestions
    const matches = content.match(/"([^"]+)"/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

// Chatbot component
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatbot = useMemo(() => new AIChatbotService(), []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const context = getCurrentContext();
      const response = await chatbot.sendMessage(input, context);

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-chatbot">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full w-12 h-12"
          aria-label="Open AI Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">AI Support</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-8'
                      : 'bg-muted mr-8'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && (
                    <div className="flex gap-1 mt-2">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="bg-muted p-2 rounded mr-8">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex w-full gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
```

**Database Schema:**
```typescript
// Chat conversations
interface ChatConversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'closed';
}

// Chat analytics
interface ChatAnalytics {
  conversationId: string;
  userId: string;
  messageCount: number;
  resolutionType: 'answered' | 'escalated' | 'abandoned';
  satisfaction?: number;
  createdAt: Timestamp;
}
```

### 7. Real-time Translation

**Technical Specifications:**
```typescript
// Translation service
class TranslationService {
  private genkit: Genkit;
  private cache: Map<string, CachedTranslation> = new Map();

  constructor() {
    this.genkit = new Genkit({
      plugins: [googleAI()],
    });
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const cacheKey = `${text}:${sourceLanguage || 'auto'}:${targetLanguage}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.result;
    }

    try {
      const result = await this.genkit.flows.translate({
        text,
        targetLanguage,
        sourceLanguage
      });

      const translationResult = {
        originalText: text,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        confidence: result.confidence
      };

      // Cache result
      this.cache.set(cacheKey, {
        result: translationResult,
        timestamp: Date.now()
      });

      return translationResult;
    } catch (error) {
      console.error('Translation failed:', error);
      throw new TranslationError('Translation service unavailable');
    }
  }

  async *streamTranslate(
    text: string,
    targetLanguage: string
  ): AsyncGenerator<string> {
    const stream = await this.genkit.flows.translate.stream({
      text,
      targetLanguage
    });

    for await (const chunk of stream) {
      yield chunk.translatedText;
    }
  }
}

// Video content translation
class VideoTranslationService {
  private translationService: TranslationService;

  async translateVideoMetadata(videoId: string, targetLanguage: string) {
    const video = await getVideo(videoId);

    const [title, description] = await Promise.all([
      this.translationService.translateText(video.title, targetLanguage),
      video.description
        ? this.translationService.translateText(video.description, targetLanguage)
        : Promise.resolve(null)
    ]);

    const translatedVideo = {
      ...video,
      title: title.translatedText,
      description: description?.translatedText || video.description,
      originalLanguage: video.language || 'en',
      translatedLanguage: targetLanguage
    };

    // Cache translated metadata
    await cacheTranslatedVideo(videoId, targetLanguage, translatedVideo);

    return translatedVideo;
  }

  async getTranslatedSubtitles(videoId: string, targetLanguage: string) {
    const subtitles = await getVideoSubtitles(videoId, 'en'); // Assume English source

    const translatedCues = await Promise.all(
      subtitles.cues.map(async (cue) => ({
        ...cue,
        text: (await this.translationService.translateText(
          cue.text,
          targetLanguage
        )).translatedText
      }))
    );

    return {
      ...subtitles,
      cues: translatedCues,
      language: targetLanguage
    };
  }
}

// Translation UI component
function TranslationToggle({ content, onTranslate }) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);

  const handleTranslate = async (targetLanguage: string) => {
    setIsTranslating(true);
    try {
      const result = await onTranslate(targetLanguage);
      setTranslatedContent(result);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="translation-controls">
      <Select onValueChange={handleTranslate} disabled={isTranslating}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Translate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
          <SelectItem value="it">Italiano</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="ko">한국어</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>

      {isTranslating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Translating...
        </div>
      )}

      {translatedContent && (
        <div className="translated-content">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">Translated Content</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranslatedContent(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 bg-muted rounded">
            {translatedContent}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Social Features Implementation

### 8. User Blocking/Muting System

**Technical Specifications:**
```typescript
// Privacy controls service
class PrivacyControlsService {
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    // Add to block list
    await addDoc(collection(firestore, 'userBlocks'), {
      blockerId,
      blockedId,
      createdAt: serverTimestamp(),
      reason: 'user_initiated'
    });

    // Remove any existing follows
    await unfollowUser(blockerId, blockedId);

    // Hide existing content from blocked user
    await hideBlockedContent(blockerId, blockedId);

    analytics.track('user_blocked', { blockerId, blockedId });
  }

  async muteUser(muterId: string, mutedId: string): Promise<void> {
    await addDoc(collection(firestore, 'userMutes'), {
      muterId,
      mutedId,
      createdAt: serverTimestamp()
    });

    // Stop notifications from muted user
    await disableNotifications(muterId, mutedId);

    analytics.track('user_muted', { muterId, mutedId });
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const blockQuery = query(
      collection(firestore, 'userBlocks'),
      where('blockerId', '==', blockerId),
      where('blockedId', '==', blockedId)
    );

    const blockDocs = await getDocs(blockQuery);
    const deletePromises = blockDocs.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);

    // Restore visibility of previously hidden content
    await restoreBlockedContent(blockerId, blockedId);

    analytics.track('user_unblocked', { blockerId, blockedId });
  }

  async isUserBlocked(viewerId: string, targetId: string): Promise<boolean> {
    const blockQuery = query(
      collection(firestore, 'userBlocks'),
      where('blockerId', '==', viewerId),
      where('blockedId', '==', targetId)
    );

    const blockDocs = await getDocs(blockQuery);
    return !blockDocs.empty;
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const blockQuery = query(
      collection(firestore, 'userBlocks'),
      where('blockerId', '==', userId)
    );

    const blockDocs = await getDocs(blockQuery);
    const blockedIds = blockDocs.docs.map(doc => doc.data().blockedId);

    if (blockedIds.length === 0) return [];

    // Get user details for blocked users
    const usersQuery = query(
      collection(firestore, 'users'),
      where('__name__', 'in', blockedIds.slice(0, 10)) // Firestore 'in' limit
    );

    const userDocs = await getDocs(usersQuery);
    return userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// Privacy controls component
function PrivacyControls({ targetUser }) {
  const { user } = useUser();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (user && targetUser) {
      checkPrivacyStatus();
    }
  }, [user, targetUser]);

  const checkPrivacyStatus = async () => {
    const [blocked, muted] = await Promise.all([
      privacyService.isUserBlocked(user.id, targetUser.id),
      privacyService.isUserMuted(user.id, targetUser.id)
    ]);

    setIsBlocked(blocked);
    setIsMuted(muted);
  };

  const handleBlock = async () => {
    try {
      if (isBlocked) {
        await privacyService.unblockUser(user.id, targetUser.id);
        setIsBlocked(false);
      } else {
        await privacyService.blockUser(user.id, targetUser.id);
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Block action failed:', error);
    }
  };

  const handleMute = async () => {
    try {
      if (isMuted) {
        await privacyService.unmuteUser(user.id, targetUser.id);
        setIsMuted(false);
      } else {
        await privacyService.muteUser(user.id, targetUser.id);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Mute action failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMute}>
          {isMuted ? (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Unmute User
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              Mute User
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleBlock}
          className={isBlocked ? 'text-green-600' : 'text-red-600'}
        >
          {isBlocked ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Unblock User
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 mr-2" />
              Block User
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Database Schema:**
```typescript
// User blocks
interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  reason: 'user_initiated' | 'admin_action' | 'system';
  createdAt: Timestamp;
  expiresAt?: Timestamp; // For temporary blocks
}

// User mutes
interface UserMute {
  id: string;
  muterId: string;
  mutedId: string;
  createdAt: Timestamp;
  notificationTypes: NotificationType[]; // Which notifications to mute
}

// Privacy settings
interface PrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'friends' | 'private';
  activityVisibility: 'public' | 'friends' | 'private';
  allowMessages: 'everyone' | 'friends' | 'none';
  showOnlineStatus: boolean;
  blockedUsers: string[]; // Cached for performance
  mutedUsers: string[];
  updatedAt: Timestamp;
}
```

## Administrative Enhancements

### 9. Content Moderation Queue

**Technical Specifications:**
```typescript
// Moderation service
class ContentModerationService {
  async getModerationQueue(filters: ModerationFilters): Promise<ModerationItem[]> {
    let query = collection(firestore, 'moderationQueue');

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    if (filters.contentType) {
      query = query.where('contentType', '==', filters.contentType);
    }

    // Order by priority and creation date
    query = query.orderBy('priority', 'desc').orderBy('createdAt', 'asc');

    const snapshot = await getDocs(query);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async moderateContent(
    itemId: string,
    action: ModerationAction,
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    const itemRef = doc(firestore, 'moderationQueue', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      throw new Error('Moderation item not found');
    }

    const item = itemDoc.data() as ModerationItem;

    // Update moderation item
    await updateDoc(itemRef, {
      status: action,
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp(),
      moderationReason: reason,
      updatedAt: serverTimestamp()
    });

    // Take action based on moderation decision
    if (action === 'approve') {
      await this.approveContent(item);
    } else if (action === 'reject') {
      await this.rejectContent(item, reason);
    } else if (action === 'flag') {
      await this.flagContent(item, reason);
    }

    // Log moderation action
    await this.logModerationAction(item, action, moderatorId, reason);

    analytics.track('content_moderated', {
      itemId,
      action,
      contentType: item.contentType,
      moderatorId
    });
  }

  private async approveContent(item: ModerationItem): Promise<void> {
    if (item.contentType === 'video') {
      await updateDoc(doc(firestore, 'videos', item.contentId), {
        status: 'approved',
        moderatedAt: serverTimestamp(),
        moderatedBy: item.moderatedBy
      });
    }
    // Handle other content types...
  }

  private async rejectContent(item: ModerationItem, reason?: string): Promise<void> {
    if (item.contentType === 'video') {
      await updateDoc(doc(firestore, 'videos', item.contentId), {
        status: 'rejected',
        moderatedAt: serverTimestamp(),
        moderatedBy: item.moderatedBy,
        rejectionReason: reason
      });
    }
    // Handle other content types...
  }

  private async logModerationAction(
    item: ModerationItem,
    action: ModerationAction,
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    await addDoc(collection(firestore, 'moderationLogs'), {
      itemId: item.id,
      contentId: item.contentId,
      contentType: item.contentType,
      action,
      moderatorId,
      reason,
      timestamp: serverTimestamp()
    });
  }
}

// Moderation queue component
function ModerationQueue({ filters }) {
  const { data: queueItems, isLoading } = useQuery({
    queryKey: ['moderation-queue', filters],
    queryFn: () => moderationService.getModerationQueue(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const moderateItem = useMutation({
    mutationFn: ({ itemId, action, reason }) =>
      moderationService.moderateContent(itemId, action, currentUser.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-queue']);
      toast.success('Content moderated successfully');
    },
    onError: (error) => {
      toast.error('Moderation failed: ' + error.message);
    }
  });

  if (isLoading) {
    return <ModerationQueueSkeleton />;
  }

  return (
    <div className="moderation-queue">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Content Moderation Queue</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilters({ status: 'pending' })}>
            Pending ({queueItems.filter(item => item.status === 'pending').length})
          </Button>
          <Button variant="outline" onClick={() => setFilters({ priority: 'high' })}>
            High Priority ({queueItems.filter(item => item.priority === 'high').length})
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {queueItems.map(item => (
          <ModerationItemCard
            key={item.id}
            item={item}
            onModerate={(action, reason) =>
              moderateItem.mutate({ itemId: item.id, action, reason })
            }
          />
        ))}
      </div>

      {queueItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items in moderation queue
        </div>
      )}
    </div>
  );
}

// Individual moderation item card
function ModerationItemCard({ item, onModerate }) {
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState('');

  const handleModerate = () => {
    if (action) {
      onModerate(action, reason);
      setAction(null);
      setReason('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>
              {item.contentType} • Submitted {formatDistance(item.createdAt, new Date(), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={
            item.priority === 'high' ? 'destructive' :
            item.priority === 'medium' ? 'default' : 'secondary'
          }>
            {item.priority} priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Content Preview</h4>
            {item.contentType === 'video' && (
              <VideoPreview videoId={item.contentId} />
            )}
            {item.contentType === 'comment' && (
              <CommentPreview commentId={item.contentId} />
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Moderation Actions</h4>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant={action === 'approve' ? 'default' : 'outline'}
                  onClick={() => setAction('approve')}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={action === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setAction('reject')}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              {action === 'reject' && (
                <Textarea
                  placeholder="Reason for rejection (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              )}

              <Button
                onClick={handleModerate}
                disabled={!action}
                className="w-full"
              >
                Confirm Moderation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Database Schema:**
```typescript
// Moderation queue
interface ModerationItem {
  id: string;
  contentId: string;
  contentType: 'video' | 'comment' | 'user' | 'playlist';
  title: string;
  description?: string;
  submittedBy: string;
  submittedAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flags: ModerationFlag[];
  aiAnalysis?: AIAnalysis;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  moderationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Moderation flags
interface ModerationFlag {
  type: 'inappropriate' | 'copyright' | 'spam' | 'harassment' | 'other';
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  reason?: string;
  createdAt: Timestamp;
}

// AI analysis results
interface AIAnalysis {
  contentScore: number; // 0-1, higher = more likely inappropriate
  categories: string[];
  confidence: number;
  analyzedAt: Timestamp;
}

// Moderation logs
interface ModerationLog {
  id: string;
  itemId: string;
  contentId: string;
  contentType: string;
  action: ModerationAction;
  moderatorId: string;
  reason?: string;
  previousStatus: string;
  newStatus: string;
  timestamp: Timestamp;
}
```

## Testing Specifications

### Unit Testing Requirements
```typescript
// Video player adaptive streaming tests
describe('AdaptiveStreamingManager', () => {
  let manager: AdaptiveStreamingManager;
  let mockVideo: HTMLVideoElement;
  let mockConnectionMonitor: ConnectionMonitor;

  beforeEach(() => {
    mockVideo = document.createElement('video');
    mockConnectionMonitor = new ConnectionMonitor();
    manager = new AdaptiveStreamingManager(mockVideo);
  });

  test('should initialize HLS with correct config', () => {
    expect(manager.hls.config.enableWorker).toBe(true);
    expect(manager.hls.config.lowLatencyMode).toBe(true);
  });

  test('should adapt quality based on connection', async () => {
    mockConnectionMonitor.setConnection({ downlink: 1 });
    await manager.adaptQuality();

    expect(manager.hls.currentLevel).toBe(0); // Lowest quality
  });

  test('should handle manifest loading errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(manager.loadManifest('invalid-url')).rejects.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load manifest:', expect.any(Error));
  });
});

// AI chatbot service tests
describe('AIChatbotService', () => {
  let chatbot: AIChatbotService;

  beforeEach(() => {
    chatbot = new AIChatbotService();
  });

  test('should send message and receive response', async () => {
    const mockResponse = {
      message: 'Hello! How can I help you today?',
      suggestions: ['Browse videos', 'Update profile']
    };

    mockGenkitResponse(mockResponse);

    const response = await chatbot.sendMessage('Hello', {
      userName: 'Test User',
      currentPage: '/home'
    });

    expect(response.message).toBe(mockResponse.message);
    expect(response.suggestions).toEqual(mockResponse.suggestions);
  });

  test('should handle API errors gracefully', async () => {
    mockGenkitError(new Error('API unavailable'));

    const response = await chatbot.sendMessage('Hello', {});

    expect(response.message).toContain('having trouble responding');
  });
});
```

### Integration Testing Requirements
```typescript
// End-to-end moderation workflow
describe('Content Moderation E2E', () => {
  test('moderator can approve pending video', async () => {
    // Create test video
    const videoId = await createTestVideo();

    // Submit for moderation
    await submitForModeration(videoId);

    // Navigate to moderation queue
    await page.goto('/admin/moderation');

    // Approve video
    await page.click(`[data-video-id="${videoId}"] [data-action="approve"]`);

    // Verify video status
    const video = await getVideo(videoId);
    expect(video.status).toBe('approved');

    // Verify moderation log
    const logs = await getModerationLogs(videoId);
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('approve');
  });
});

// Performance testing
describe('Video Player Performance', () => {
  test('should maintain 60fps during quality switches', async () => {
    const performanceMonitor = new PerformanceMonitor();

    // Start monitoring
    performanceMonitor.startTracking();

    // Trigger quality switch
    await switchVideoQuality('1080p');

    // Check frame rate
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.averageFps).toBeGreaterThan(55);
  });
});
```

### Accessibility Testing Requirements
```typescript
// WCAG compliance tests
describe('Video Player Accessibility', () => {
  test('should have proper ARIA labels', () => {
    render(<VideoPlayer video={mockVideo} />);

    expect(screen.getByLabelText('Video player')).toBeInTheDocument();
    expect(screen.getByLabelText('Play video')).toBeInTheDocument();
    expect(screen.getByLabelText('Pause video')).toBeInTheDocument();
  });

 