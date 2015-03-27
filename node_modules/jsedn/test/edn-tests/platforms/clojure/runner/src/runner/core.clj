(ns runner.core
  (:require [clojure.edn :as edn]
            [clojure.string :as string])
  (:use clojure.pprint)
  (:import java.io.File))

(defn tagged-item [tag value] {:tag tag :value value})

(defn comp-forms [clj-file edn-file]
  (= (read-string (slurp clj-file))
     (edn/read-string {:eof nil :default tagged-item} (slurp edn-file))))

(defn get-current-directory []
  (. (File. ".") getCanonicalPath))

(defn -main [] 
  (let [cur-dir (get-current-directory)
        edn-dir (str cur-dir "/../../../valid-edn/")
        clj-dir (str cur-dir "/../")
        edn-files (.listFiles (File. edn-dir))]
       (pprint 
         (into {} 
               (map (fn [file]
                        (let [file-name (first (string/split (. file getName) #"\."))
                              result (comp-forms (str clj-dir file-name ".clj")
                                                 (str edn-dir file-name ".edn"))]
                             [(symbol file-name) result])) edn-files)))))
