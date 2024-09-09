"use client";
import Sidenavbar from "@/components/sidenavbar"
import BlackButton1 from "@/components/ui/BlackButton1"
import FgPostTemplate from "@/components/fgpostTemplate"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Loader } from "lucide-react";
import Header from "@/components/header";
import { SignedIn } from "@/components/signed-in";
import { getAllFGPosts } from "@/services/fg_post";
import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";


import { getCurrentUser } from '@/services/profile';
import { collection, query, where, getDocs } from "firebase/firestore"; 
import { firestore } from "@/lib/firebase"; 





export default function projects() {
    const router = useRouter(); 
    const [user, loading] = useAuthState(auth); 
    const [posts, setPosts] = useState<any>([])
    const [loadingPosts, setLoadingPosts] = useState(true); 
    const [currentPost, setCurrentPost] = useState<any>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            }
        }
    }, [loading, user, router]);

    useEffect(() => {
        fetchPosts() 
        console.log(posts) 

    }, [user])

    const fetchPosts = async () => {
        try {
            const currentUser = await getCurrentUser(user);
            if (currentUser) {
                const q = query(collection(firestore, "fg_post"));
                const querySnapshot = await getDocs(q);
                const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(userPosts);
                console.log(posts)
            }
        } catch (error) {
            console.error("Error fetching posts: ", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const getPost = () => {
        console.log(posts)
    }

    const handlePostClick = (post: any) => {
        console.log(post)
        console.log("here here")
        setCurrentPost(post);
    };

    const interested = () => {
        console.log(currentPost)
        if (user) {
            addUserToInterested(currentPost.id, "ball");
        } else {
            console.error("User not authenticated");
        }
        

    }
    const addUserToInterested = async (postId: string, userId: string) => {
        const currentUser = await getCurrentUser(user);
        userId = currentUser.id
        try {
            const postRef = doc(firestore, "fg_post", postId);
            await updateDoc(postRef, {
                interested: arrayUnion(userId) // Adds the user ID to the array if not already present
            });
            console.log("User added to interested list");
        } catch (error) {
            console.error("Error updating interested list: ", error);
        }
    };

    

    
    return (
        <>
             {loading ? 
            <div className="flex justify-center items-center w-screen h-screen">
                <Loader className="animate-spin w-10 h-10"></Loader> 
            </div>
            
            : <></>}
            <SignedIn>
                <Header></Header>
                <div className="bg-[#f6f6f6] h-screen flex">
                    
                    <Sidenavbar/>
                    <div className="p-10 w-1/2">
                        <a href="createProjectPost">
                            
                        <BlackButton1 text="+ Create Project" />

                        </a>
                        <div className="flex flex-col gap-2 mt-4">
                        {posts.length > 0 ? (
                                posts.map((post: any) => (
                                    
                                    <FgPostTemplate title={post.title} description={post.projectOverview} onClick={() => handlePostClick(post)}/>
                                ))
                            ) : (
                                <p>No posts found.</p>
                            )}
                        </div>
                        
                    
                        

                    </div>
                    <div className="w-1/2">
                        {currentPost && (
                                <div className="fixed right-0 top-0 bg-white w-1/2 h-full p-4 shadow-lg">
                                    <h2 className="text-2xl font-bold">{currentPost.title}</h2>
                                    <p className="text-lg mt-2">{currentPost.projectOverview}</p>
                                    <button onClick={interested}>interested?</button>

                                    {/* Add more details about the post here */}
                                </div>
                            )}


                    </div>
                </div>
            </SignedIn>
            
        </>
    )
}