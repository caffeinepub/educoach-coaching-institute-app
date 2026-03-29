import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Authorization "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = Authorization.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type Course = {
    title : Text;
    description : Text;
    category : Text;
    subjectTags : [Text];
  };

  type LiveClass = {
    title : Text;
    teacher : Text;
    scheduledTime : Time.Time;
    isLive : Bool;
  };

  type StudyMaterial = {
    title : Text;
    subject : Text;
    chapter : Text;
  };

  type TestSeries = {
    title : Text;
    subject : Text;
    totalMarks : Nat;
  };

  type StudentProgress = {
    enrolledCourses : [Nat];
    completionPercentage : Nat;
  };

  module Course {
    public func compareByTitle(course1 : (Nat, Course), course2 : (Nat, Course)) : Order.Order {
      let titleOrder = Text.compare(course1.1.title, course2.1.title);
      switch (titleOrder) {
        case (#equal) { Nat.compare(course1.0, course2.0) };
        case (other) { other };
      };
    };
  };

  module LiveClass {
    public func compareByScheduledTime(class1 : (Nat, LiveClass), class2 : (Nat, LiveClass)) : Order.Order {
      let timeOrder = Int.compare(class1.1.scheduledTime, class2.1.scheduledTime);
      switch (timeOrder) {
        case (#equal) { Nat.compare(class1.0, class2.0) };
        case (other) { other };
      };
    };
  };

  module StudyMaterial {
    public func compareByTitle(material1 : (Nat, StudyMaterial), material2 : (Nat, StudyMaterial)) : Order.Order {
      let titleOrder = Text.compare(material1.1.title, material2.1.title);
      switch (titleOrder) {
        case (#equal) { Nat.compare(material1.0, material2.0) };
        case (other) { other };
      };
    };
  };

  module TestSeries {
    public func compareByTitle(series1 : (Nat, TestSeries), series2 : (Nat, TestSeries)) : Order.Order {
      let titleOrder = Text.compare(series1.1.title, series2.1.title);
      switch (titleOrder) {
        case (#equal) { Nat.compare(series1.0, series2.0) };
        case (other) { other };
      };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let courses = Map.empty<Nat, Course>();
  let liveClasses = Map.empty<Nat, LiveClass>();
  let studyMaterials = Map.empty<Nat, StudyMaterial>();
  let testSeries = Map.empty<Nat, TestSeries>();
  let studentProgress = Map.empty<Principal, StudentProgress>();

  var nextCourseId = 1;
  var nextClassId = 1;
  var nextMaterialId = 1;
  var nextTestId = 1;

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialization function to seed sample data (admin only)
  public shared ({ caller }) func initializeSampleData() : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize sample data");
    };

    // Seed sample courses
    let course1 : Course = {
      title = "Mathematics Basics";
      description = "Fundamental math concepts for beginners";
      category = "Mathematics";
      subjectTags = ["algebra", "geometry"];
    };

    let course2 : Course = {
      title = "Physics Principles";
      description = "Core physics topics for students";
      category = "Science";
      subjectTags = ["mechanics", "optics"];
    };

    let course3 : Course = {
      title = "Chemistry Foundations";
      description = "Basic chemistry concepts and experiments";
      category = "Science";
      subjectTags = ["organic", "inorganic"];
    };

    courses.add(nextCourseId, course1);
    nextCourseId += 1;
    courses.add(nextCourseId, course2);
    nextCourseId += 1;
    courses.add(nextCourseId, course3);
    nextCourseId += 1;

    // Seed sample live classes
    let class1 : LiveClass = {
      title = "Math Live Session";
      teacher = "Mr. Sharma";
      scheduledTime = 1_726_020_000_000_000_000; // Example timestamp
      isLive = false;
    };

    let class2 : LiveClass = {
      title = "Physics Live Class";
      teacher = "Dr. Mehta";
      scheduledTime = 1_725_960_000_000_000_000;
      isLive = false;
    };

    let class3 : LiveClass = {
      title = "Chemistry Lab";
      teacher = "Prof. Singh";
      scheduledTime = 1_726_100_000_000_000_000;
      isLive = false;
    };

    liveClasses.add(nextClassId, class1);
    nextClassId += 1;
    liveClasses.add(nextClassId, class2);
    nextClassId += 1;
    liveClasses.add(nextClassId, class3);
    nextClassId += 1;

    // Seed sample study materials
    let material1 : StudyMaterial = {
      title = "Algebra Notes";
      subject = "Mathematics";
      chapter = "Algebra";
    };

    let material2 : StudyMaterial = {
      title = "Physics Lab Manual";
      subject = "Physics";
      chapter = "Experiments";
    };

    let material3 : StudyMaterial = {
      title = "Chemistry Reactions Guide";
      subject = "Chemistry";
      chapter = "Chemical Reactions";
    };

    studyMaterials.add(nextMaterialId, material1);
    nextMaterialId += 1;
    studyMaterials.add(nextMaterialId, material2);
    nextMaterialId += 1;
    studyMaterials.add(nextMaterialId, material3);
    nextMaterialId += 1;

    // Seed sample test series
    let test1 : TestSeries = {
      title = "Math Test Series";
      subject = "Mathematics";
      totalMarks = 100;
    };

    let test2 : TestSeries = {
      title = "Physics Test";
      subject = "Physics";
      totalMarks = 80;
    };

    let test3 : TestSeries = {
      title = "Chemistry Quiz";
      subject = "Chemistry";
      totalMarks = 70;
    };

    testSeries.add(nextTestId, test1);
    nextTestId += 1;
    testSeries.add(nextTestId, test2);
    nextTestId += 1;
    testSeries.add(nextTestId, test3);
    nextTestId += 1;
  };

  // Course management (admin only)
  public shared ({ caller }) func addCourse(course : Course) : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    courses.add(nextCourseId, course);
    let id = nextCourseId;
    nextCourseId += 1;
    id;
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray();
  };

  public query ({ caller }) func getCourseById(courseId : Nat) : async ?Course {
    courses.get(courseId);
  };

  public shared ({ caller }) func updateCourse(courseId : Nat, course : Course) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update courses");
    };
    if (not courses.containsKey(courseId)) {
      Runtime.trap("Course not found");
    };
    courses.add(courseId, course);
  };

  public shared ({ caller }) func deleteCourse(courseId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete courses");
    };
    if (not courses.containsKey(courseId)) {
      Runtime.trap("Course not found");
    };
    courses.remove(courseId);
  };

  // Live class management (admin only)
  public shared ({ caller }) func addLiveClass(liveClass : LiveClass) : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add live classes");
    };
    liveClasses.add(nextClassId, liveClass);
    let id = nextClassId;
    nextClassId += 1;
    id;
  };

  public query ({ caller }) func getAllLiveClasses() : async [LiveClass] {
    liveClasses.values().toArray();
  };

  public query ({ caller }) func getLiveClassById(classId : Nat) : async ?LiveClass {
    liveClasses.get(classId);
  };

  public shared ({ caller }) func updateLiveClass(classId : Nat, liveClass : LiveClass) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update live classes");
    };
    if (not liveClasses.containsKey(classId)) {
      Runtime.trap("Live class not found");
    };
    liveClasses.add(classId, liveClass);
  };

  public shared ({ caller }) func deleteLiveClass(classId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete live classes");
    };
    if (not liveClasses.containsKey(classId)) {
      Runtime.trap("Live class not found");
    };
    liveClasses.remove(classId);
  };

  // Study material management (admin only)
  public shared ({ caller }) func addStudyMaterial(material : StudyMaterial) : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add study materials");
    };
    studyMaterials.add(nextMaterialId, material);
    let id = nextMaterialId;
    nextMaterialId += 1;
    id;
  };

  public query ({ caller }) func getAllStudyMaterials() : async [StudyMaterial] {
    studyMaterials.values().toArray();
  };

  public query ({ caller }) func getStudyMaterialById(materialId : Nat) : async ?StudyMaterial {
    studyMaterials.get(materialId);
  };

  public shared ({ caller }) func updateStudyMaterial(materialId : Nat, material : StudyMaterial) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update study materials");
    };
    if (not studyMaterials.containsKey(materialId)) {
      Runtime.trap("Study material not found");
    };
    studyMaterials.add(materialId, material);
  };

  public shared ({ caller }) func deleteStudyMaterial(materialId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete study materials");
    };
    if (not studyMaterials.containsKey(materialId)) {
      Runtime.trap("Study material not found");
    };
    studyMaterials.remove(materialId);
  };

  // Test series management (admin only)
  public shared ({ caller }) func addTestSeries(series : TestSeries) : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add test series");
    };
    testSeries.add(nextTestId, series);
    let id = nextTestId;
    nextTestId += 1;
    id;
  };

  public query ({ caller }) func getAllTestSeries() : async [TestSeries] {
    testSeries.values().toArray();
  };

  public query ({ caller }) func getTestSeriesById(testId : Nat) : async ?TestSeries {
    testSeries.get(testId);
  };

  public shared ({ caller }) func updateTestSeries(testId : Nat, series : TestSeries) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update test series");
    };
    if (not testSeries.containsKey(testId)) {
      Runtime.trap("Test series not found");
    };
    testSeries.add(testId, series);
  };

  public shared ({ caller }) func deleteTestSeries(testId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete test series");
    };
    if (not testSeries.containsKey(testId)) {
      Runtime.trap("Test series not found");
    };
    testSeries.remove(testId);
  };

  // Student progress (user)
  public shared ({ caller }) func enrollInCourse(courseId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can enroll in courses");
    };
    if (not courses.containsKey(courseId)) {
      Runtime.trap("Course not found");
    };
    let progress = switch (studentProgress.get(caller)) {
      case (null) {
        let newProgress : StudentProgress = {
          enrolledCourses = [courseId];
          completionPercentage = 0;
        };
        studentProgress.add(caller, newProgress);
        newProgress;
      };
      case (?existing) {
        if (existing.enrolledCourses.filter(func(id) { id == courseId }).isEmpty()) {
          let updatedCourses = existing.enrolledCourses.concat([courseId]);
          let updatedProgress : StudentProgress = {
            enrolledCourses = updatedCourses;
            completionPercentage = existing.completionPercentage;
          };
          studentProgress.add(caller, updatedProgress);
        };
        existing;
      };
    };
  };

  public query ({ caller }) func getMyProgress() : async ?StudentProgress {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view progress");
    };
    studentProgress.get(caller);
  };

  public shared ({ caller }) func updateCompletionPercentage(courseId : Nat, percentage : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update completion percentage");
    };
    let existingProgress = switch (studentProgress.get(caller)) {
      case (null) { Runtime.trap("Progress not found") };
      case (?progress) {
        if (progress.enrolledCourses.filter(func(id) { id == courseId }).isEmpty()) {
          Runtime.trap("Not enrolled in this course");
        };
        let updatedProgress : StudentProgress = {
          enrolledCourses = progress.enrolledCourses;
          completionPercentage = percentage;
        };
        studentProgress.add(caller, updatedProgress);
        updatedProgress;
      };
    };
  };

  public query ({ caller }) func getAllCoursesSortedByTitle() : async [(Nat, Course)] {
    courses.toArray().sort(Course.compareByTitle);
  };

  public query ({ caller }) func getAllLiveClassesSortedByTime() : async [(Nat, LiveClass)] {
    liveClasses.toArray().sort(LiveClass.compareByScheduledTime);
  };

  public query ({ caller }) func getAllStudyMaterialsSortedByTitle() : async [(Nat, StudyMaterial)] {
    studyMaterials.toArray().sort(StudyMaterial.compareByTitle);
  };

  public query ({ caller }) func getAllStudentProgress() : async [(Principal, StudentProgress)] {
    if (not (Authorization.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all student progress");
    };
    studentProgress.toArray();
  };

  public query ({ caller }) func getAllTestSeriesSortedByTitle() : async [(Nat, TestSeries)] {
    testSeries.toArray().sort(TestSeries.compareByTitle);
  };
};
