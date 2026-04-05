import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  BookOpen,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface TeacherData {
  name: string;
  branch: string;
  grades: string[];
}

interface Week {
  week: number;
  theme: string;
  unit: string;
  outcomes: string[];
  hours: number;
  methods: string[];
  assessment: string;
}

interface YearlyPlan {
  grade: string;
  weeks: Week[];
}

const CURRICULUM: Record<
  string,
  Array<{
    unit: string;
    weeks: number;
    themes: string[];
    outcomes: string[][];
    methods: string[];
    assessment: string;
  }>
> = {
  Matematik: [
    {
      unit: "Sayılar ve İşlemler",
      weeks: 6,
      themes: ["Doğal Sayılar", "Tam Sayılar", "Rasyonel Sayılar", "Üslü İfadeler", "Kök İfadeler", "Değerlendirme"],
      outcomes: [
        ["Doğal sayıları tanır ve sıralar", "Sayı doğrusunda gösterir", "EBOB ve EKOK hesaplar"],
        ["Tam sayıları tanır ve karşılaştırır", "Tam sayılarla işlem yapar", "Tam sayı problemleri çözer"],
        ["Rasyonel sayıları tanır", "Rasyonel sayıları sıralar", "İşlemler yapar"],
        ["Üslü ifadeleri yazar", "Üslü ifadelerle işlem yapar", "Bilimsel gösterimi kullanır"],
        ["Kareköklü ifadeleri sadeleştirir", "Karmaşık ifadeler çözer", "Kök denklemler kurar"],
        ["Konu tekrarı yapar", "Ünite sınavı hazırlığı", "Değerlendirme ve geri bildirim"],
      ],
      methods: ["Soru-Cevap", "Problem Çözme", "Grup Çalışması"],
      assessment: "Yazılı Sınav",
    },
    {
      unit: "Cebir",
      weeks: 5,
      themes: ["Cebirsel İfadeler", "Denklemler", "Eşitsizlikler", "Doğrusal Fonksiyonlar", "Değerlendirme"],
      outcomes: [
        ["Cebirsel ifadeleri sadeleştirir", "Çarpanlara ayırır", "Cebirsel bölme yapar"],
        ["1. dereceden denklem çözer", "Oran-orantı problemleri kurar", "Denklem sistemleri çözer"],
        ["Eşitsizlik çözer", "Çözüm kümesini bulur", "Sayı doğrusunda gösterir"],
        ["Doğrusal fonksiyonu tanır", "Grafik çizer", "Eğim ve y-kesimi bulur"],
        ["Cebir tekrarı", "Karışık alıştırmalar", "Ünite değerlendirme"],
      ],
      methods: ["Anlatım", "Tartışma", "Bağımsız Çalışma"],
      assessment: "Performans Görevi",
    },
    {
      unit: "Geometri",
      weeks: 6,
      themes: ["Açılar", "Üçgenler", "Dörtgenler", "Çember ve Daire", "Dönüşüm Geometrisi", "Değerlendirme"],
      outcomes: [
        ["Açı türlerini sınıflandırır", "Açı ölçer ve çizer", "Açı ilişkilerini açıklar"],
        ["Üçgeni tanımlar ve çizer", "Üçgen eşitsizliğini bilir", "Alan ve çevre hesaplar"],
        ["Dörtgenleri sınıflandırır", "Özellikleri karşılaştırır", "Alan formüllerini uygular"],
        ["Çember ve daireyi tanır", "Pi sayısını kullanır", "Çevre ve alan hesaplar"],
        ["Yansıma ve ötelemeyı yapar", "Dönme dönüşümü uygular", "Simetriyi tanır"],
        ["Geometri tekrarı", "Karma problem çözme", "Ünite değerlendirme"],
      ],
      methods: ["Yaparak-Yaşayarak", "Model", "Gösteri"],
      assessment: "Proje",
    },
    {
      unit: "Veri İşleme ve Olasılık",
      weeks: 5,
      themes: ["Veri Toplama", "Merkezi Eğilim", "Grafikler", "Olasılık Temelleri", "Değerlendirme"],
      outcomes: [
        ["Veri toplar ve düzenler", "Tablo oluşturur", "Frekans tablosu çizer"],
        ["Ortalama, medyan, mod hesaplar", "Veri setini yorumlar", "Karşılaştırma yapar"],
        ["Sütun grafik çizer", "Pasta grafik okur", "Çizgi grafik yorumlar"],
        ["Olasılık tanımını bilir", "Basit olay olasılığı hesaplar", "Deneysel olasılık bulur"],
        ["Veri ve olasılık tekrarı", "Yorumlama alıştırmaları", "Ünite değerlendirme"],
      ],
      methods: ["Araştırma", "Proje", "İşbirlikli Öğrenme"],
      assessment: "İstatistik Projesi",
    },
    {
      unit: "Ölçme",
      weeks: 4,
      themes: ["Uzunluk ve Alan", "Hacim ve Ağırlık", "Zaman ve Para", "Değerlendirme"],
      outcomes: [
        ["Uzunluk birimleri dönüşümü yapar", "Alan ve çevre hesaplar", "Kesik şekiller çözer"],
        ["Hacim birimlerini dönüştürür", "Prizma hacmini hesaplar", "Ağırlık problemleri çözer"],
        ["Zaman hesapları yapar", "Para problemleri çözer", "Karma ölçme soruları çözer"],
        ["Ölçme tekrarı", "Karma soru çözme", "Dönem değerlendirme"],
      ],
      methods: ["Gözlem", "Deney", "Tartışma"],
      assessment: "Yazılı Sınav",
    },
    {
      unit: "Sözel Problemler ve Karma",
      weeks: 10,
      themes: [
        "Oran - Orantı",
        "Yüzde",
        "Faiz Hesapları",
        "Karışım Problemleri",
        "İş - Zaman Problemleri",
        "Hız - Zaman - Mesafe",
        "Yaş Problemleri",
        "Sayı Problemleri",
        "Kesirli Denklemler",
        "Karma Tekrar",
      ],
      outcomes: [
        ["Oran ve orantı kurar", "Doğru orantı problemleri çözer", "Ters orantı problemleri çözer"],
        ["Yüzde hesaplar", "İndirim ve zam problemleri çözer", "Kar-zarar hesaplar"],
        ["Basit faiz hesaplar", "Bileşik faiz anlar", "Faiz problemleri çözer"],
        ["Karışım problemleri kurar", "Denklem ile çözer", "Karışım formülü uygular"],
        ["İş problemleri kurar", "Çözüm stratejileri uygular", "Zaman-verimlilik hesaplar"],
        ["HZM problemleri kurar", "Ortalama hız hesaplar", "Karşılıklı gidiş problemleri çözer"],
        ["Yaş problemleri kurar", "Denklem ile çözer", "Karmaşık yaş problemleri çözer"],
        ["Sayı problemleri çözer", "Ardışık sayı problemleri çözer", "Basamak problemleri çözer"],
        ["Kesirli denklem kurar", "Oranlı problem çözer", "Karma denklem çözer"],
        ["Tüm konuları tekrar eder", "Karma sorular çözer", "Yıl sonu değerlendirme"],
      ],
      methods: ["Problem Çözme", "Soru-Cevap", "Beyin Fırtınası"],
      assessment: "Proje ve Yazılı Sınav",
    },
  ],
  Türkçe: [
    {
      unit: "Okuma ve Anlama",
      weeks: 6,
      themes: ["Metin Türleri", "Okuduğunu Anlama", "Çıkarım Yapma", "Tahmin Etme", "Eleştirel Okuma", "Değerlendirme"],
      outcomes: [
        ["Metin türlerini tanır ve ayırt eder", "Bilgilendirici metin okur", "Edebi metin okur"],
        ["Ana fikri belirler", "Yardımcı fikirleri sıralar", "Konu ile tema farkını bilir"],
        ["Metinden çıkarım yapar", "Örtük anlam bulur", "Yorum cümlesi yazar"],
        ["Metni okumadan tahmin yürütür", "Başlıktan anlam çıkarır", "Sonucu tahmin eder"],
        ["Yazarın amacını sorgular", "Kanıt ve görüş ayrımı yapar", "Taraflılığı fark eder"],
        ["Okuma tekniklerini tekrar eder", "Karma metin çalışması", "Ünite sınavı"],
      ],
      methods: ["Sesli Okuma", "Sessiz Okuma", "Tartışma"],
      assessment: "Okuma Anlama Testi",
    },
    {
      unit: "Yazma Becerileri",
      weeks: 5,
      themes: ["Yazma Süreci", "Anlatım Türleri", "Hikâye Yazma", "Makale ve Deneme", "Değerlendirme"],
      outcomes: [
        ["Yazma planı yapar", "Giriş-gelişme-sonuç yazar", "Paragraf düzenler"],
        ["Açıklayıcı metin yazar", "Tartışmacı metin yazar", "İkna edici metin yazar"],
        ["Hikâye unsurlarını kullanır", "Diyalog yazar", "Betimleyici ifadeler kullanır"],
        ["Makale planı yapar", "Deneme yazar", "Kendi görüşünü destekler"],
        ["Yazma tekrarı", "Gözden geçirme ve düzenleme", "Ünite değerlendirme"],
      ],
      methods: ["Yaratıcı Yazarlık", "Akran Değerlendirme", "Portfolyo"],
      assessment: "Yazarlık Portfolyosu",
    },
    {
      unit: "Dil Bilgisi",
      weeks: 8,
      themes: ["Kelime Türleri", "Cümle Yapısı", "Fiil Çekimleri", "Cümle Türleri", "Sözcük Türetme", "Anlam Bilgisi", "Yazım Kuralları", "Değerlendirme"],
      outcomes: [
        ["Ad, sıfat, zarf, zamir tanır", "Bağlaç ve edat ayırt eder", "Kelime türlerini sınıflandırır"],
        ["Cümle ögelerini bulur", "Özne ve yüklemi belirler", "Nesneleri sınıflandırır"],
        ["Zaman eklerini uygular", "Kip çekimlerini bilir", "Fiil kökü ve eklerini ayırır"],
        ["Soru cümlesi yazar", "Koşul cümlesi kurar", "Bağlı cümle yapısı kullanır"],
        ["Ek ile sözcük türetir", "Yapım eklerini bilir", "Yeni kelimeler üretir"],
        ["Gerçek ve mecaz anlam ayırır", "Deyim ve atasöz kullanır", "Eş anlam ve zıt anlam bulur"],
        ["Yazım kurallarını uygular", "Noktalama işaretlerini doğru kullanır", "Yazım yanlışlarını düzeltir"],
        ["Dil bilgisi genel tekrarı", "Karma çalışmalar", "Ünite değerlendirme"],
      ],
      methods: ["Analiz", "Sentez", "Gramer Alıştırmaları"],
      assessment: "Yazılı Sınav",
    },
    {
      unit: "Edebiyat ve Şiir",
      weeks: 5,
      themes: ["Şiir Unsurları", "Şiir Yorumlama", "Anlatı Türleri", "Edebi Figürler", "Değerlendirme"],
      outcomes: [
        ["Şiir unsurlarını tanır", "Ölçü ve kafiyeyi bilir", "Şiiri sesli okur"],
        ["Şiiri yorumlar", "Şairin duygusunu açıklar", "Kendi şiirini yazar"],
        ["Hikâye, roman, masal farkını bilir", "Anlatı öğelerini tanır", "Olay örgüsü çıkarır"],
        ["Kişileştirme ve benzetme kullanır", "Edebi sanatları tanır", "Anlatımı zenginleştirir"],
        ["Edebiyat tekrarı", "Metinleri karşılaştırır", "Dönem değerlendirme"],
      ],
      methods: ["Edebi Analiz", "Tartışma", "Yaratıcı Yazarlık"],
      assessment: "Şiir ve Hikâye Projesi",
    },
    {
      unit: "Sözlü İletişim",
      weeks: 4,
      themes: ["Dinleme Becerileri", "Sunum Yapma", "Tartışma ve Münazara", "Değerlendirme"],
      outcomes: [
        ["Aktif dinleme yapar", "Not alır", "Dinlediklerini özetler"],
        ["Sunum planlar", "Görsel materyal hazırlar", "Etkili sunum yapar"],
        ["Tartışmada görüş belirtir", "Kanıt kullanır", "Münazara kurallarını bilir"],
        ["Sözlü iletişim tekrarı", "Performans sunumu", "Dönem değerlendirme"],
      ],
      methods: ["Drama", "Sunum", "Münazara"],
      assessment: "Sözlü Sınav",
    },
    {
      unit: "Genel Tekrar",
      weeks: 8,
      themes: [
        "Metin Çalışması",
        "Yazma Pratiği",
        "Dil Bilgisi Tekrarı",
        "Kelime Çalışması",
        "LGS Hazırlık",
        "Karma Test",
        "Değerlendirme",
        "Yıl Sonu Etkinlik",
      ],
      outcomes: [
        ["Karma metin okur ve yorumlar", "Hız ve anlama becerilerini geliştirir", "Üst düzey sorulara hazırlanır"],
        ["Farklı türlerde yazar", "Yazma hızını artırır", "Bağımsız yazma yapar"],
        ["Tüm dil bilgisi konularını tekrar eder", "Karmaşık yapılar çözer", "Analitik düşünür"],
        ["Kelime haznesi genişletir", "Sözcükleri bağlamda kullanır", "Eş ve zıt anlamlı listeler yapar"],
        ["LGS formatında sorular çözer", "Zaman yönetimi uygular", "Strateji geliştirir"],
        ["Tüm konulardan karma test çözer", "Hataları analiz eder", "Geri bildirim alır"],
        ["Yıl değerlendirmesi yapar", "Hedef belirleme çalışması", "Portfolyo sunar"],
        ["Okuma-yazma etkinlikleri", "Yaratıcı proje", "Ödüllendirme"],
      ],
      methods: ["Problem Çözme", "Test Çözme", "Grup Çalışması"],
      assessment: "LGS Deneme Sınavı",
    },
  ],
  İngilizce: [
    {
      unit: "Unit 1: Back to School",
      weeks: 4,
      themes: ["Introductions", "School Objects", "Daily Routine", "Revision"],
      outcomes: [
        ["Introduce oneself and others", "Use personal pronouns correctly", "Ask and answer personal questions"],
        ["Name school objects and supplies", "Use 'there is/are' structures", "Describe classroom environment"],
        ["Talk about daily routine", "Use Present Simple Tense", "Ask about frequency with adverbs"],
        ["Review unit vocabulary", "Complete grammar exercises", "Unit test preparation"],
      ],
      methods: ["Communicative Activities", "Role Play", "Group Discussion"],
      assessment: "Unit Test",
    },
    {
      unit: "Unit 2: Family and Friends",
      weeks: 4,
      themes: ["Family Members", "Describing People", "Possessive Structures", "Revision"],
      outcomes: [
        ["Describe family members", "Use family vocabulary", "Talk about relationships"],
        ["Describe physical appearance", "Use adjectives for personality", "Compare people"],
        ["Use possessive adjectives and pronouns", "Show belonging", "Write a family description"],
        ["Review family topics", "Writing assessment", "Unit evaluation"],
      ],
      methods: ["Pair Work", "Writing Activities", "Visual Learning"],
      assessment: "Writing Task",
    },
    {
      unit: "Unit 3: Hobbies and Free Time",
      weeks: 4,
      themes: ["Hobbies", "Like/Dislike", "Sports Activities", "Revision"],
      outcomes: [
        ["Talk about hobbies and interests", "Use -ing forms with hobby verbs", "Express preferences"],
        ["Use like/love/hate + -ing", "Express opinions about activities", "Agree and disagree"],
        ["Name sports and equipment", "Use can/can't for ability", "Describe sports events"],
        ["Review hobbies and sports", "Oral presentation", "Unit test"],
      ],
      methods: ["Project Work", "Presentation", "Survey Activity"],
      assessment: "Oral Presentation",
    },
    {
      unit: "Unit 4: Food and Health",
      weeks: 4,
      themes: ["Food Vocabulary", "Ordering Food", "Health and Body", "Revision"],
      outcomes: [
        ["Name food and drink items", "Use countable/uncountable nouns", "Talk about eating habits"],
        ["Use 'would you like' for ordering", "Give and follow instructions", "Understand a menu"],
        ["Name body parts", "Describe symptoms", "Use should/shouldn't for advice"],
        ["Review food and health topics", "Roleplay at restaurant", "Unit assessment"],
      ],
      methods: ["Roleplay", "Listening Activities", "Collaborative Learning"],
      assessment: "Roleplay Assessment",
    },
    {
      unit: "Unit 5: Adventure and Travel",
      weeks: 4,
      themes: ["Travel Vocabulary", "Past Simple", "Giving Directions", "Revision"],
      outcomes: [
        ["Name travel items and places", "Describe a trip", "Use prepositions of place"],
        ["Use Past Simple Tense (regular)", "Use Past Simple (irregular verbs)", "Ask questions about past events"],
        ["Give and follow directions", "Use prepositions of direction", "Read a map"],
        ["Review travel topics", "Writing about a journey", "Unit test"],
      ],
      methods: ["Story Telling", "Map Activities", "Collaborative Writing"],
      assessment: "Travel Journal Writing",
    },
    {
      unit: "Unit 6: Celebrations and Events",
      weeks: 4,
      themes: ["Special Days", "Future Plans", "Invitations", "Revision and Final"],
      outcomes: [
        ["Talk about holidays and celebrations", "Describe traditions", "Compare festivals"],
        ["Use 'will' for future plans", "Make predictions", "Talk about intentions"],
        ["Accept and refuse invitations", "Write an invitation card", "Plan a celebration"],
        ["Year review", "Final project presentation", "End of year assessment"],
      ],
      methods: ["Project", "Cultural Learning", "Creative Writing"],
      assessment: "Final Project",
    },
  ],
  "Fen Bilimleri": [
    {
      unit: "Madde ve Değişim",
      weeks: 6,
      themes: ["Maddenin Yapısı", "Maddenin Halleri", "Saf Maddeler", "Karışımlar", "Kimyasal Değişim", "Değerlendirme"],
      outcomes: [
        ["Atomu tanımlar", "Element ve bileşik farkını bilir", "Atom modellerini açıklar"],
        ["Maddenin hallerini sınıflandırır", "Hal değişimlerini açıklar", "Erime ve kaynama noktasını bilir"],
        ["Saf madde ve karışımı ayırt eder", "Element ve bileşiği karşılaştırır", "Saf madde özelliklerini listeler"],
        ["Homojen ve heterojen karışım tanır", "Karışım ayırma yöntemlerini açıklar", "Filtrasyon ve damıtma yapar"],
        ["Fiziksel ve kimyasal değişim farkını bilir", "Kimyasal reaksiyon örneği verir", "Yanma olayını açıklar"],
        ["Madde konusu tekrarı", "Karma sorular çözer", "Ünite sınavı"],
      ],
      methods: ["Deney", "Gözlem", "Raporlama"],
      assessment: "Laboratuvar Ödevi",
    },
    {
      unit: "Canlılar Dünyası",
      weeks: 5,
      themes: ["Hücre", "Canlı Grupları", "Bitkilerde Üreme", "Hayvanlarda Üreme", "Değerlendirme"],
      outcomes: [
        ["Hücreyi tanımlar", "Prokaryot-ökaryot farkını bilir", "Bitki-hayvan hücresi karşılaştırır"],
        ["Canlı âlemlerini sıralar", "Omurgalı-omurgasız hayvanları karşılaştırır", "Canlı sınıflandırması yapar"],
        ["Bitkisel üreme çeşitlerini bilir", "Eşeyli üreme örneklerini verir", "Polen ve meyve oluşumunu açıklar"],
        ["Eşeysiz üreme örneklerini bilir", "Döl almaşı anlayışını geliştirir", "Omurgalı üremesini açıklar"],
        ["Canlılar dünyası tekrarı", "Proje sunumu", "Ünite değerlendirme"],
      ],
      methods: ["Mikroskop Çalışması", "Model", "Proje"],
      assessment: "Araştırma Projesi",
    },
    {
      unit: "Kuvvet ve Hareket",
      weeks: 5,
      themes: ["Kuvvet Kavramı", "Newton Yasaları", "Ağırlık ve Kütle", "Basit Makineler", "Değerlendirme"],
      outcomes: [
        ["Kuvveti tanımlar", "Kuvveti ölçer", "Kuvvetin etkilerini açıklar"],
        ["Eylemsizlik yasasını açıklar", "F=m×a ilişkisini kurar", "Etki-tepki kuvvetlerini bilir"],
        ["Ağırlık ve kütleyi ayırt eder", "Sürtünme kuvvetini açıklar", "Yerçekimi ivmesini hesaplar"],
        ["Kaldıraç, makara, eğik düzlemi tanır", "Mekanik avantajı hesaplar", "Basit makine kullanımını açıklar"],
        ["Kuvvet ve hareket tekrarı", "Problem çözme pratiği", "Ünite değerlendirme"],
      ],
      methods: ["Deney", "Problem Çözme", "Simülasyon"],
      assessment: "Deney Raporu",
    },
    {
      unit: "Işık ve Ses",
      weeks: 5,
      themes: ["Işığın Özellikleri", "Yansıma ve Kırılma", "Ayna ve Mercek", "Sesin Yayılması", "Değerlendirme"],
      outcomes: [
        ["Işığın düz yayıldığını açıklar", "Saydam, yarı saydam, opak maddeler", "Gölge ve ay tutulmasını açıklar"],
        ["Yansıma yasalarını bilir", "Kırılmayı açıklar", "Tam yansımayı örnekler"],
        ["Düz, konkav, konveks ayna karşılaştırır", "İnce kenar ve kalın kenar merceği bilir", "Görüntü özelliklerini açıklar"],
        ["Sesin yayılmasını açıklar", "Frekans ve genlik ilişkisini bilir", "Ekoyu örneklendirir"],
        ["Işık ve ses tekrarı", "Karma deney çalışması", "Ünite değerlendirme"],
      ],
      methods: ["Gösteri Deneyi", "Gözlem", "Video Analiz"],
      assessment: "Proje Ödevi",
    },
    {
      unit: "Elektrik ve Enerji",
      weeks: 5,
      themes: ["Elektrik Yükü", "Elektrik Devresi", "Elektrik Enerjisi", "Enerji Kaynakları", "Değerlendirme"],
      outcomes: [
        ["Statik elektriği açıklar", "İletken ve yalıtkan madde listeler", "Elektrik yükü birimini bilir"],
        ["Seri ve paralel devre kurar", "Devre şeması çizer", "Ampermetre ve voltmetre kullanır"],
        ["Elektrik enerjisini hesaplar", "Elektrik gücü formülünü uygular", "Tasarruf yollarını listeler"],
        ["Yenilenebilir enerji kaynakları listeler", "Fosil yakıtları açıklar", "Enerji dönüşümlerini açıklar"],
        ["Elektrik tekrarı", "Proje sunumu", "Ünite değerlendirme"],
      ],
      methods: ["Deney", "Proje", "Araştırma"],
      assessment: "Enerji Projesi",
    },
    {
      unit: "Genel Tekrar ve Değerlendirme",
      weeks: 10,
      themes: [
        "Madde Tekrarı",
        "Canlılar Tekrarı",
        "Kuvvet Tekrarı",
        "Işık-Ses Tekrarı",
        "Elektrik Tekrarı",
        "Bilim Tarihi",
        "STEM Projeleri",
        "LGS Hazırlık",
        "Karma Test",
        "Yıl Sonu",
      ],
      outcomes: [
        ["Madde ve değişim sorularını çözer", "Kimya konularını hatırlar", "Hata analizini yapar"],
        ["Canlılar konusunu özet geçer", "Biyoloji sorularını çözer", "Kavram haritası çizer"],
        ["Kuvvet ve hareket problemleri çözer", "Sayısal sorularda hız kazanır", "Yorum ve analiz yapar"],
        ["Işık ve ses konusunu tekrar eder", "Deney sorularını cevaplar", "Karmaşık sorulara hazırlanır"],
        ["Elektrik konusunu tekrar eder", "Devre problemleri çözer", "Enerji hesaplamaları yapar"],
        ["Önemli bilim insanlarını tanır", "Bilimsel yöntemi açıklar", "Teknolojik gelişmeleri tartışır"],
        ["STEM projesi tasarlar", "Mühendislik çözümü üretir", "Sunum hazırlar"],
        ["LGS formatında sorular çözer", "Zaman yönetimi geliştirir", "Stratejik planlama yapar"],
        ["Tüm konuları kapsayan test", "Performans analizi", "Geri bildirim"],
        ["Yıl değerlendirmesi", "Öğrenci sunumları", "Ödül töreni"],
      ],
      methods: ["Test Çözme", "STEM", "Proje"],
      assessment: "Yıl Sonu Projesi",
    },
  ],
};

function generatePlan(grade: string, branch: string): YearlyPlan {
  const units = CURRICULUM[branch] || [
    {
      unit: "Ünite 1",
      weeks: 6,
      themes: ["Konu 1", "Konu 2", "Konu 3", "Konu 4", "Konu 5", "Değerlendirme"],
      outcomes: [["Temel kavramları öğrenir"], ["Konuyu uygular"], ["Değerlendirme yapar"], [], [], []],
      methods: ["Anlatım", "Soru-Cevap"],
      assessment: "Yazılı Sınav",
    },
  ];

  const weeks: Week[] = [];
  let weekNum = 1;

  for (const unit of units) {
    for (let i = 0; i < unit.weeks; i++) {
      weeks.push({
        week: weekNum++,
        theme: unit.themes[i] || unit.themes[unit.themes.length - 1],
        unit: unit.unit,
        outcomes: unit.outcomes[i] || unit.outcomes[0],
        hours: 4,
        methods: unit.methods,
        assessment: unit.assessment,
      });
      if (weekNum > 36) break;
    }
    if (weekNum > 36) break;
  }

  return { grade, weeks };
}

export function Plans() {
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [yearlyPlans, setYearlyPlans] = useState<YearlyPlan[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2, 3]));

  const generationSteps = [
    "Müfredat analiz ediliyor...",
    "Kazanımlar düzenleniyor...",
    "Yöntemler atanıyor...",
    "Haftalık dağılım yapılıyor...",
    "Değerlendirme planı oluşturuluyor...",
    "Plan finalize ediliyor...",
  ];

  useEffect(() => {
    const data = localStorage.getItem("teacherData");
    if (data) {
      const parsed: TeacherData = JSON.parse(data);
      setTeacherData(parsed);
      setSelectedGrade(parsed.grades[0] || "");
      const savedPlans = localStorage.getItem("yearlyPlans");
      if (savedPlans) {
        setYearlyPlans(JSON.parse(savedPlans));
      }
    }
  }, []);

  const generateYearlyPlan = () => {
    if (!teacherData) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep(generationSteps[0]);

    let stepIdx = 0;
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const next = prev + 100 / (generationSteps.length * 5);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const plans = teacherData.grades.map((grade) => generatePlan(grade, teacherData.branch));
            setYearlyPlans(plans);
            localStorage.setItem("yearlyPlans", JSON.stringify(plans));
            setIsGenerating(false);
            toast.success("Yıllık planlar başarıyla oluşturuldu!", {
              description: `${teacherData.grades.length} sınıf için ${plans[0]?.weeks.length || 36} haftalık plan hazırlandı.`,
            });
          }, 300);
          return 100;
        }
        stepIdx = Math.min(Math.floor((next / 100) * generationSteps.length), generationSteps.length - 1);
        setGenerationStep(generationSteps[stepIdx]);
        return next;
      });
    }, 80);
  };

  const resetPlans = () => {
    setYearlyPlans([]);
    localStorage.removeItem("yearlyPlans");
    toast.info("Planlar sıfırlandı");
  };

  const downloadPlan = (format: "excel" | "word") => {
    toast.success(`Plan ${format === "excel" ? "Excel" : "Word"} formatında indiriliyor...`, {
      description: "Dosya birkaç saniye içinde hazır olacak.",
    });
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const currentPlan = yearlyPlans.find((p) => p.grade === selectedGrade);

  const groupWeeksByUnit = (weeks: Week[]) => {
    const groups: { unit: string; weeks: Week[] }[] = [];
    for (const week of weeks) {
      const last = groups[groups.length - 1];
      if (last && last.unit === week.unit) {
        last.weeks.push(week);
      } else {
        groups.push({ unit: week.unit, weeks: [week] });
      }
    }
    return groups;
  };

  const unitColors = [
    { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", header: "bg-blue-100" },
    { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-600", header: "bg-violet-100" },
    { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-600", header: "bg-emerald-100" },
    { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-600", header: "bg-amber-100" },
    { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-600", header: "bg-rose-100" },
    { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-600", header: "bg-cyan-100" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Yıllık Planlar
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Müfredatınıza uygun otomatik yıllık plan oluşturun</p>
        </div>
        {yearlyPlans.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => downloadPlan("word")} variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Word
            </Button>
            <Button onClick={() => downloadPlan("excel")} variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button onClick={resetPlans} variant="ghost" size="sm" className="text-slate-400 gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              Sıfırla
            </Button>
          </div>
        )}
      </div>

      {/* Generate Section */}
      {yearlyPlans.length === 0 && !isGenerating && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-slate-800 mb-2" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                Yıllık Planınızı Oluşturun
              </h2>
              <p className="text-slate-500 mb-2 max-w-md">
                {teacherData?.branch} branşı için {teacherData?.grades.length} sınıfın{" "}
                <span style={{ fontWeight: 600 }}>36 haftalık</span> yıllık planı otomatik olarak oluşturulacak.
              </p>
              <p className="text-slate-400 text-sm mb-8">
                Kazanımlar, öğretim yöntemleri ve ölçme-değerlendirme planlanmış şekilde hazırlanır.
              </p>
              <Button size="lg" onClick={generateYearlyPlan} className="h-13 px-10 bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg">
                <Sparkles className="w-5 h-5" />
                Yıllık Plan Oluştur
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generating Animation */}
      {isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="py-20">
              <div className="text-center space-y-6 max-w-sm mx-auto">
                <div className="relative w-24 h-24 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200"
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-slate-800 mb-1" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    Plan Oluşturuluyor
                  </h2>
                  <p className="text-slate-500 text-sm">{generationStep}</p>
                </div>
                <div className="space-y-2">
                  <Progress value={generationProgress} className="h-3" />
                  <p className="text-sm text-slate-400">%{Math.round(generationProgress)} tamamlandı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plans Display */}
      {yearlyPlans.length > 0 && !isGenerating && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-200" />
                <div>
                  <p className="text-blue-100 text-xs">Toplam</p>
                  <p className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                    {currentPlan?.weeks.length || 0} Hafta
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-violet-200" />
                <div>
                  <p className="text-violet-100 text-xs">Ünite</p>
                  <p className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                    {groupWeeksByUnit(currentPlan?.weeks || []).length} Ünite
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="w-8 h-8 text-emerald-200" />
                <div>
                  <p className="text-emerald-100 text-xs">Ders Saati</p>
                  <p className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                    {(currentPlan?.weeks.length || 0) * 4}s
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Tabs */}
          {yearlyPlans.length > 1 && (
            <Tabs value={selectedGrade} onValueChange={setSelectedGrade}>
              <TabsList className="h-10">
                {yearlyPlans.map((plan) => (
                  <TabsTrigger key={plan.grade} value={plan.grade} className="text-sm">
                    {plan.grade}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Units and Weeks */}
          {currentPlan && (
            <div className="space-y-4">
              {groupWeeksByUnit(currentPlan.weeks).map((group, gIdx) => {
                const colors = unitColors[gIdx % unitColors.length];
                return (
                  <motion.div
                    key={group.unit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gIdx * 0.06 }}
                  >
                    <Card className={`border ${colors.border} overflow-hidden`}>
                      <div className={`${colors.header} px-5 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={`${colors.badge} text-white text-xs px-2.5 py-1 rounded-full`} style={{ fontWeight: 600 }}>
                            Ünite {gIdx + 1}
                          </div>
                          <h3 className="text-slate-800" style={{ fontWeight: 700 }}>
                            {group.unit}
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {group.weeks.length} Hafta • {group.weeks.length * 4} Saat
                        </Badge>
                      </div>

                      <div className={`${colors.bg} divide-y divide-slate-100`}>
                        {group.weeks.map((week, wIdx) => (
                          <div key={week.week} className="px-5">
                            <button
                              onClick={() => toggleWeek(week.week)}
                              className="w-full flex items-center gap-4 py-3 text-left hover:opacity-80 transition-opacity"
                            >
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-200">
                                <span className="text-xs text-slate-600" style={{ fontWeight: 700 }}>
                                  {week.week}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>
                                  {week.theme}
                                </p>
                                <p className="text-xs text-slate-400">{week.hours} ders saati</p>
                              </div>
                              {expandedWeeks.has(week.week) ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedWeeks.has(week.week) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pb-4 space-y-3">
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>
                                        KAZANIMLAR
                                      </p>
                                      <div className="space-y-1.5">
                                        {week.outcomes.map((o, oIdx) => (
                                          <div key={oIdx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-slate-600">{o}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-4 text-xs text-slate-500">
                                      <span>
                                        <span style={{ fontWeight: 600 }}>Yöntem:</span> {week.methods.join(", ")}
                                      </span>
                                      <span>
                                        <span style={{ fontWeight: 600 }}>Ölçme:</span> {week.assessment}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Download Banner */}
          <Card className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>
                    Planı İndir
                  </h3>
                  <p className="text-blue-100 text-sm">Okul bilgileri otomatik eklenir (Ayarlar'dan yapılandırın)</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadPlan("word")}
                    className="bg-white text-blue-700 hover:bg-blue-50 gap-2 h-10"
                  >
                    <FileText className="w-4 h-4" />
                    Word İndir
                  </Button>
                  <Button
                    onClick={() => downloadPlan("excel")}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 h-10"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel İndir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
