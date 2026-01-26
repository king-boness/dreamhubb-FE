export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface RegistrationOptions {
  id: number;
  title: string;
}
export interface Category{
  id: number,
  title: string,
  description: string
}

export interface Post{
  post_id?: number,
  description: string,
  goalName: string,
  goalImage: string,
  postType?: "dream" | "problem" | "idea" | string,
  karma: number,
  image: string,
  images?: string[] | null,
  user: {
    userName: string,
    userPicture: string,
    badge: string,
  },
  postInfo:{
    dateCreated:string,
    location:string,
    viewed:number
  }
}
export interface PostDetail {
  post_id: number;
  title: string;
  description: string;
  date_created: string;
  date_deadline: string | null;
  tokens: number;
  views: number;
  category_name: string;
  category_image?: string | null;

  author_id?: number;
  author_name: string;
  author_picture?: string | null;
  author_city?: string | null;
  author_country?: string | null;
  author_continent?: string | null;
  user_id?: number | null;
  user?: {
    profile_picture?: string | null;
    [key: string]: unknown;
  } | null;

  images: string[];
}
export interface Notification{
  user:{
    userName:string,
    userPicture:string,
  }
  description:string
  goalName:string
  type:string
}
export interface Inspiration{
  user:{
    userName:string,
    userPicture:string,
  }
  description:string
  inspirationInfo:{
    dateCreated:string
    likes:number
    inspirationImage: string,
  }
}

export interface PriceCards{
  description:string
  tokens:{
    amount:string,
    price:number,
    img:string
  }
}
export interface Stats{
  usedKarma:{
    [key: string]: number;
    onDream:number
    onProblem:number,
    onIdea:number
    onDonation:number
  },
  overview:{
    title:string
    comesFrom:string
    comesFromImg:string
    comesFromValue:number
  },
}
export interface specificSpending{

  label:string
  value:string
  icon:string
  tokens:number
}

export interface UserProfile{
  user:{
    userName:string,
    userPicture:string,
    userBackground:string,
    dateCreated:string,
    location:string,
    views:number
  }
  reviews:{
    description:string
    userReviewed:string
    userReviewedPicture:string
    dateReviewed:string
  }
  categories:{
    name:string,
    amount:number,
    img:string,
    destination:string
  }
  donations:{
    donatedValue:number
    postDonatedName:string
    postDonatedBackground:string
    postDonatedCategoryImg:string
    postOwner:string
    postOwnerPicture:string
    description:string
  }
  dreams: {
    category:string
    type:string
    donatedValue:number
    postDreamName:string
    postDreamBackground:string
    postDreamCategoryImg:string
    postOwner:string
    postOwnerPicture:string
    description:string
  }
  comments:{
    donatedValue:number
    donatedImage:string
    donationOwnerName:string
    donationOwnerPicture:string
    description:string
    private:boolean
    type:string
    typeOfHelp:string
    amountOfHelp:number
  }

}
export interface UserDatas{
  email:string,
}
export interface History{
  historyTitle:string
}
export interface Topic{
  topicTitle:string
}
export interface OnGoingTask{
  description:string
  amount:number
}
export interface FinishedTask{
  description:string
  amount:number
}
export interface CarouselPost{
  value:string
  title:string
  text:string
  img:string
}
export interface PostCategories{
  goalImg:string
  specificGoalImg:string
}
export interface tokensOption{
  img:string
  text:string
}
export interface donorDescription{
  text:string
}
export interface doneeDescription{
  text:string
}
