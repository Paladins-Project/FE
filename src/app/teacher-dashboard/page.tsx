import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, Calendar, MessageSquare, Search, TrendingUp, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import TeacherLayout from "@/components/layouts/teacher-layout"

export default function TeacherDashboardPage() {
  return (
    
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e1e1e]">Teacher Dashboard</h1>
            <p className="text-[#6b7280]">Welcome back, Ms. Johnson! Here's an overview of your classes.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder="Search students..." className="pl-10 bg-white border-none w-64" />
            </div>
            <Button className="bg-[#4dacc4] hover:bg-[#3b8a9e]">
              <BookOpen className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value="48"
            change="+3 new"
            icon={<User className="h-5 w-5 text-[#4dacc4]" />}
            bgColor="bg-[#d7ebf0]"
          />
          <StatCard
            title="Active Courses"
            value="12"
            change="2 pending"
            icon={<BookOpen className="h-5 w-5 text-[#f15f6c]" />}
            bgColor="bg-[#feccd6]"
          />
          <StatCard
            title="Average Score"
            value="85%"
            change="+5% this month"
            icon={<TrendingUp className="h-5 w-5 text-[#10b981]" />}
            bgColor="bg-[#ebfdf4]"
          />
          <StatCard
            title="Upcoming Events"
            value="7"
            change="Next: Tomorrow"
            icon={<Calendar className="h-5 w-5 text-[#f59e0b]" />}
            bgColor="bg-[#fff7ed]"
          />
        </div>

        {/* Class Selector */}
        <Tabs defaultValue="class-3a" className="w-full">
          <TabsList className="bg-white w-full justify-start overflow-x-auto">
            <TabsTrigger value="class-3a">Class 3A</TabsTrigger>
            <TabsTrigger value="class-3b">Class 3B</TabsTrigger>
            <TabsTrigger value="class-4a">Class 4A</TabsTrigger>
            <TabsTrigger value="add" className="text-[#4dacc4]">
              + Add Class
            </TabsTrigger>
          </TabsList>

          <TabsContent value="class-3a" className="mt-6">
            <ClassDashboard name="Class 3A" />
          </TabsContent>

          <TabsContent value="class-3b" className="mt-6">
            <ClassDashboard name="Class 3B" />
          </TabsContent>

          <TabsContent value="class-4a" className="mt-6">
            <ClassDashboard name="Class 4A" />
          </TabsContent>
        </Tabs>
      </div>
  )
}

function ClassDashboard({ name }) {
  return (
    <div className="space-y-6">
      {/* Class Overview */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-[#6b7280]">25 students • 5 subjects</p>
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" className="bg-[#4dacc4] hover:bg-[#3b8a9e]">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Class
                </Button>
                <Button size="sm" variant="outline">
                  View Schedule
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-[#d7ebf0] rounded-lg p-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-[#4dacc4]" />
                  <span className="font-medium">Average Score</span>
                </div>
                <p className="text-2xl font-bold">82%</p>
                <p className="text-sm text-[#6b7280]">+3% from last month</p>
              </div>

              <div className="bg-[#ebfdf4] rounded-lg p-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-[#10b981]" />
                  <span className="font-medium">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-sm text-[#6b7280]">Course completion</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Students</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d9d9d9]">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt={student.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-[#6b7280]">ID: {student.id}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div>
                    <p className="text-sm text-[#6b7280]">Average Score</p>
                    <p className={`font-medium ${getScoreColor(student.score)}`}>{student.score}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#6b7280]">Attendance</p>
                    <p className="font-medium">{student.attendance}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#6b7280]">Last Activity</p>
                    <p className="font-medium">{student.lastActivity}</p>
                  </div>

                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="outline">Load More</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subjects.map((subject, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className="text-sm text-[#6b7280]">{subject.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{subject.progress}%</p>
                    <p className="text-sm text-[#6b7280]">
                      {subject.completed}/{subject.total} units
                    </p>
                  </div>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Lessons */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lessons.map((lesson, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lesson.bgColor}`}>
                    {lesson.icon}
                  </div>
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-[#6b7280]">{lesson.date}</p>
                  </div>
                </div>
                <p className="text-sm text-[#4b5563] mb-3">{lesson.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" className={lesson.buttonColor}>
                    Prepare
                  </Button>
                  <Button size="sm" variant="outline">
                    Materials
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, change, icon, bgColor }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6b7280]">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-[#6b7280] mt-1">{change}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function getScoreColor(score) {
  if (score >= 90) {
    return "text-[#10b981]"
  } else if (score >= 70) {
    return "text-[#f59e0b]"
  } else {
    return "text-[#ef4444]"
  }
}

const students = [
  {
    name: "Alex Johnson",
    id: "STU-001",
    score: 92,
    attendance: 98,
    lastActivity: "Today",
  },
  {
    name: "Emma Smith",
    id: "STU-002",
    score: 85,
    attendance: 95,
    lastActivity: "Yesterday",
  },
  {
    name: "Noah Williams",
    id: "STU-003",
    score: 78,
    attendance: 90,
    lastActivity: "2 days ago",
  },
  {
    name: "Olivia Brown",
    id: "STU-004",
    score: 65,
    attendance: 85,
    lastActivity: "Today",
  },
  {
    name: "Liam Davis",
    id: "STU-005",
    score: 88,
    attendance: 92,
    lastActivity: "Today",
  },
]

const subjects = [
  {
    name: "Life Skills Basics",
    teacher: "You",
    progress: 75,
    completed: 9,
    total: 12,
  },
  {
    name: "Emotional Intelligence",
    teacher: "Mr. Johnson",
    progress: 60,
    completed: 6,
    total: 10,
  },
  {
    name: "Communication Skills",
    teacher: "Ms. Davis",
    progress: 85,
    completed: 17,
    total: 20,
  },
  {
    name: "Problem Solving",
    teacher: "Ms. Wilson",
    progress: 40,
    completed: 4,
    total: 10,
  },
]

const lessons = [
  {
    title: "Teamwork Skills",
    date: "Today, 10:00 AM",
    description: "Collaborative problem-solving activities",
    bgColor: "bg-[#d7ebf0]",
    icon: <BookOpen className="h-5 w-5 text-[#4dacc4]" />,
    buttonColor: "bg-[#4dacc4] hover:bg-[#3b8a9e]",
  },
  {
    title: "Emotional Awareness",
    date: "Tomorrow, 11:30 AM",
    description: "Identifying and managing emotions",
    bgColor: "bg-[#ebfdf4]",
    icon: <BookOpen className="h-5 w-5 text-[#10b981]" />,
    buttonColor: "bg-[#10b981] hover:bg-[#059669]",
  },
  {
    title: "Public Speaking",
    date: "Wednesday, 9:00 AM",
    description: "Building confidence in presentations",
    bgColor: "bg-[#e0f2fe]",
    icon: <BookOpen className="h-5 w-5 text-[#0ea5e9]" />,
    buttonColor: "bg-[#0ea5e9] hover:bg-[#0284c7]",
  },
]
