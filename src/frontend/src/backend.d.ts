import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LiveClass {
    title: string;
    scheduledTime: Time;
    teacher: string;
    isLive: boolean;
}
export type Time = bigint;
export interface StudentProgress {
    completionPercentage: bigint;
    enrolledCourses: Array<bigint>;
}
export interface StudyMaterial {
    title: string;
    subject: string;
    chapter: string;
}
export interface TestSeries {
    totalMarks: bigint;
    title: string;
    subject: string;
}
export interface UserProfile {
    name: string;
}
export interface Course {
    title: string;
    subjectTags: Array<string>;
    description: string;
    category: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCourse(course: Course): Promise<bigint>;
    addLiveClass(liveClass: LiveClass): Promise<bigint>;
    addStudyMaterial(material: StudyMaterial): Promise<bigint>;
    addTestSeries(series: TestSeries): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCourse(courseId: bigint): Promise<void>;
    deleteLiveClass(classId: bigint): Promise<void>;
    deleteStudyMaterial(materialId: bigint): Promise<void>;
    deleteTestSeries(testId: bigint): Promise<void>;
    enrollInCourse(courseId: bigint): Promise<void>;
    getAllStudentProgress(): Promise<Array<[Principal, StudentProgress]>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllCoursesSortedByTitle(): Promise<Array<[bigint, Course]>>;
    getAllLiveClasses(): Promise<Array<LiveClass>>;
    getAllLiveClassesSortedByTime(): Promise<Array<[bigint, LiveClass]>>;
    getAllStudyMaterials(): Promise<Array<StudyMaterial>>;
    getAllStudyMaterialsSortedByTitle(): Promise<Array<[bigint, StudyMaterial]>>;
    getAllTestSeries(): Promise<Array<TestSeries>>;
    getAllTestSeriesSortedByTitle(): Promise<Array<[bigint, TestSeries]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseById(courseId: bigint): Promise<Course | null>;
    getLiveClassById(classId: bigint): Promise<LiveClass | null>;
    getMyProgress(): Promise<StudentProgress | null>;
    getStudyMaterialById(materialId: bigint): Promise<StudyMaterial | null>;
    getTestSeriesById(testId: bigint): Promise<TestSeries | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCompletionPercentage(courseId: bigint, percentage: bigint): Promise<void>;
    updateCourse(courseId: bigint, course: Course): Promise<void>;
    updateLiveClass(classId: bigint, liveClass: LiveClass): Promise<void>;
    updateStudyMaterial(materialId: bigint, material: StudyMaterial): Promise<void>;
    updateTestSeries(testId: bigint, series: TestSeries): Promise<void>;
}
